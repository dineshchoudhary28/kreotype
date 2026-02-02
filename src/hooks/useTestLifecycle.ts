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
    stopTimer();
    replayRecorder.stop();

    const { words, wordInputs, currentInput, activeWordIndex, isActive } =
      useTypingStore.getState();
    // Moved finishTest() call to end to prevent race condition

    const elapsedMs = getElapsedMs();
    const elapsed = elapsedMs / 1000;
    const testEndTime = performance.now();
    const history = useInputHistoryStore.getState();

    // Track incomplete test if bailed out early
    if (isActive && activeWordIndex < words.length - 1) {
      const acc = calculateAccuracy(history.accuracy.correct, history.accuracy.incorrect);
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

      const result: TestResult = {
        wpm,
        rawWpm: raw,
        accuracy,
        consistency,
        keyConsistency,
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
      const validation = validateResult(result, {
        mode: config.mode,
        wordCount: config.words,
        timeConfig: config.time,
        keypressCountHistory: history.keypressCountHistory,
        isRepeated: typingState.isRepeated,
      });

      const finalResult = { ...result, validation };
      useResultStore.getState().setResult(finalResult);

      // Fire-and-forget result submission to backend
      submitResult(finalResult, {
        mode: config.mode,
        time: config.time,
        words: config.words,
        language: config.language,
        difficulty: config.difficulty,
        punctuation: config.punctuation,
        numbers: config.numbers,
        blindMode: config.blindMode,
      }).then((res) => {
        if (res?.isPb) {
          useResultStore.getState().setResult({ ...finalResult, isPb: true });
        }
      });
    } catch (err) {
      console.error("Error calculating test results:", err);
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
  }, [startTimer]);

  useEffect(() => {
    if (!hasInitRef.current) {
      hasInitRef.current = true;
      initTest();
    }
  }, [initTest]);

  return { initTest, restartTest, finishTest, onFirstKeypress, replayRecorder };
}