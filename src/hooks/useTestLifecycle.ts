"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useResultStore } from "@/store/useResultStore";
import { useTestTimer } from "./useTestTimer";
import { generateWords, generateQuoteWords, generateQuoteById } from "@/core/word-generator";
import { countChars } from "@/core/char-counter";
import {
  calculateWpmAndRaw,
  calculateAccuracy,
  calculateConsistency,
  calculateKeyConsistency,
  calculateAfkDuration,
} from "@/core/stats-calculator";
import { validateResult } from "@/core/result-validator";
import { createReplayRecorder } from "@/core/replay";
import type { TestResult } from "@/types/test";
import { submitResult } from "@/core/result-submitter";
import englishWords from "@/data/languages/english.json";
import englishQuotesRaw from "@/data/quotes/english.json";
import type { QuoteData } from "@/types/test";

const englishQuotes = englishQuotesRaw as QuoteData[];

const MAX_INIT_RETRIES = 3;

export function useTestLifecycle() {
  const finishTestRef = useRef<() => void>(() => {});
  const { start: startTimer, stop: stopTimer, getElapsedMs } = useTestTimer(() => {
    finishTestRef.current();
  });
  const hasInitRef = useRef(false);
  const initRetryCountRef = useRef(0);

  const replayRecorder = useMemo(() => createReplayRecorder(), []);

  const finishTest = useCallback(() => {
    // Capture elapsed BEFORE stopping timer (stop nulls the ref, losing the value)
    const elapsedMs = getElapsedMs();
    stopTimer();
    replayRecorder.stop();

    const { words, wordInputs, currentInput, activeWordIndex, isActive } =
      useTypingStore.getState();

    const elapsed = elapsedMs / 1000;
    const testEndTime = performance.now();
    const history = useInputHistoryStore.getState();

    // Check if this is a time-mode natural completion (timer expired)
    const config = useConfigStore.getState();
    const isTimeModeCompletion = config.mode === "time" && elapsed >= config.time - 1;

    // Track incomplete test if bailed out early (NOT for time-mode timer expiration)
    if (isActive && activeWordIndex < words.length - 1 && !isTimeModeCompletion) {
      useTypingStore.getState().addIncompleteTestSeconds(elapsed);
      useTypingStore.getState().incrementRestartCount();

      // If test was too short, just record it and don't produce a result
      if (elapsed < 1) {
         useTypingStore.getState().finishTest();
         return;
      }
    }

    try {
      const chars = countChars(words, wordInputs, currentInput, activeWordIndex);
      const { wpm, raw } = calculateWpmAndRaw(
        chars.correctWordChars,
        chars.correctSpaces,
        chars.allCharsTyped,
        elapsed
      );
      const accuracy = calculateAccuracy(
        history.accuracy.correct,
        history.accuracy.incorrect
      );
      const consistency = calculateConsistency(history.rawHistory);
      const keyConsistency = calculateKeyConsistency(history.keypressSpacings);
      const afkDuration = calculateAfkDuration(history.keypressCountHistory, elapsed);
      const keypressTimings = history.getKeypressTimings(testEndTime);

      const safeNum = (v: number, fallback = 0) => (isNaN(v) || !isFinite(v) ? fallback : v);

      const result: TestResult = {
        wpm: safeNum(wpm),
        rawWpm: safeNum(raw),
        accuracy: safeNum(accuracy, 100),
        consistency: safeNum(consistency, 100),
        keyConsistency: safeNum(keyConsistency, 100),
        correctChars: chars.allCorrectChars,
        incorrectChars: chars.incorrectChars,
        extraChars: chars.extraChars,
        missedChars: chars.missedChars,
        correctSpaces: chars.correctSpaces,
        time: Math.round(elapsed * 100) / 100,
        wpmHistory: history.wpmHistory,
        rawHistory: history.rawHistory,
        burstHistory: history.burstHistory,
        errorHistory: history.errorHistory,
        keypressTimings,
        charStats: {
          correct: chars.allCorrectChars,
          incorrect: chars.incorrectChars,
          extra: chars.extraChars,
          missed: chars.missedChars,
        },
        afkDuration,
      };

      const config = useConfigStore.getState();
      const typingState = useTypingStore.getState();
      const inputHistory = useInputHistoryStore.getState();
      const validation = validateResult(result, {
        mode: config.mode,
        wordCount: config.words,
        timeConfig: config.time,
        keypressCountHistory: history.keypressCountHistory,
        isRepeated: typingState.isRepeated,
        mouseWasMoved: inputHistory.mouseWasMoved,
        windowWasBlurred: inputHistory.windowWasBlurred,
      });

      const finalResult = { ...result, validation };
      useResultStore.getState().setResult(finalResult);

      // Submit result to backend with status tracking
      const submitConfig = {
        mode: config.mode,
        time: config.time,
        words: config.words,
        language: config.language,
        difficulty: config.difficulty,
        punctuation: config.punctuation,
        numbers: config.numbers,
        blindMode: config.blindMode,
      };
      useResultStore.getState().setSaveStatus("saving");
      submitResult(finalResult, submitConfig).then(({ data, error }) => {
        if (error) {
          useResultStore.getState().setSaveStatus(
            error.type === "unauthenticated" ? "unauthenticated" : "failed"
          );
          // Cache failed result to localStorage for retry
          if (error.type === "failed") {
            useResultStore.getState().savePendingResult(finalResult, submitConfig);
          }
          return;
        }
        useResultStore.getState().setSaveStatus("saved");
        useResultStore.getState().clearPendingResult();
        if (data?.isPb) {
          useResultStore.getState().setResult({ ...finalResult, isPb: true });
        }
      }).catch(() => {
        useResultStore.getState().setSaveStatus("failed");
        useResultStore.getState().savePendingResult(finalResult, submitConfig);
      });
    } catch (err) {
      console.error("Error calculating test results:", err);
      useResultStore.getState().setError(
        err instanceof Error ? err.message : "Failed to calculate test results"
      );
    } finally {
      // Always finish the test state, even if calculation fails
      useTypingStore.getState().finishTest();
    }
  }, [stopTimer, getElapsedMs, replayRecorder]);

  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  const initTest = useCallback(() => {
    stopTimer();
    const config = useConfigStore.getState();
    const { isActive, words: currentWords } = useTypingStore.getState();
    let words: string[];

    const genOptions = {
      punctuation: config.punctuation,
      numbers: config.numbers,
      lazyMode: config.lazyMode,
      britishEnglish: config.britishEnglish,
      language: config.language,
    };

    try {
      // Repeat Quotes Logic
      if (config.mode === "quote" && config.repeatQuotes === "typing" && isActive && currentWords.length > 0) {
        words = currentWords;
      } else if (config.mode === "quote") {
        // Support selected quote ID
        const selectedId = useTypingStore.getState().selectedQuoteId;
        if (selectedId !== null) {
          const result = generateQuoteById(englishQuotes, selectedId);
          if (result) {
            words = result.words;
          } else {
            const { words: quoteWords } = generateQuoteWords(englishQuotes);
            words = quoteWords;
          }
        } else {
          const { words: quoteWords } = generateQuoteWords(englishQuotes);
          words = quoteWords;
        }
      } else if (config.mode === "zen") {
        words = generateWords(englishWords, 100, genOptions);
      } else if (config.mode === "words") {
        words = generateWords(englishWords, config.words, genOptions);
      } else {
        // time mode
        words = generateWords(englishWords, 200, genOptions);
      }

      useTypingStore.getState().initTest(words);
      useTypingStore.getState().setTestInitSuccess(true);
      useInputHistoryStore.getState().reset();
      useResultStore.getState().clearResult();
      replayRecorder.start(words);
      initRetryCountRef.current = 0;
    } catch (err) {
      console.error("Test init failed:", err);
      useTypingStore.getState().setTestInitSuccess(false);

      // Retry up to MAX_INIT_RETRIES times
      if (initRetryCountRef.current < MAX_INIT_RETRIES) {
        initRetryCountRef.current++;
        setTimeout(() => initTest(), 100);
      }
    }
  }, [stopTimer, replayRecorder]);

  const restartTest = useCallback(() => {
    const { isActive } = useTypingStore.getState();

    // Track incomplete test before restarting
    if (isActive) {
      const elapsedMs = getElapsedMs();
      const elapsed = elapsedMs / 1000;
      if (elapsed > 0) {
        useTypingStore.getState().addIncompleteTestSeconds(elapsed);
      }
      useTypingStore.getState().incrementRestartCount();
    }

    useTypingStore.getState().setTestRestarting(true);
    initTest();
    useTypingStore.getState().setTestRestarting(false);
  }, [initTest, getElapsedMs]);

  const onFirstKeypress = useCallback(() => {
    const now = performance.now();
    useTypingStore.getState().startTest();
    useInputHistoryStore.getState().setTestStartTime(now);
    useInputHistoryStore.getState().setBurstStart(performance.now());
    startTimer();

    // Track test started (fire-and-forget)
    fetch("/api/users/me/test-started", { method: "POST" }).catch(() => {});
  }, [startTimer]);

  useEffect(() => {
    if (!hasInitRef.current) {
      hasInitRef.current = true;
      initTest();

      // Retry any pending result from a previous failed submission
      const pending = useResultStore.getState().getPendingResult();
      if (pending) {
        submitResult(pending.result as TestResult, pending.config as unknown as Parameters<typeof submitResult>[1])
          .then(({ error }) => {
            if (!error) {
              useResultStore.getState().clearPendingResult();
            }
          })
          .catch(() => {});
      }
    }
  }, [initTest]);

  return { initTest, restartTest, finishTest, onFirstKeypress, replayRecorder };
}