"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useResultStore } from "@/store/useResultStore";
import { useTestTimer } from "./useTestTimer";
import { generateWords, generateQuoteWords } from "@/core/word-generator";
import { countChars } from "@/core/char-counter";
import {
  calculateWpmAndRaw,
  calculateAccuracy,
  calculateConsistency,
  calculateKeyConsistency,
  calculateAfkDuration,
} from "@/core/stats-calculator";
import { validateResult } from "@/core/result-validator";
import type { TestResult } from "@/types/test";
import englishWords from "@/data/languages/english.json";
import englishQuotesRaw from "@/data/quotes/english.json";
import type { QuoteData } from "@/types/test";

const englishQuotes = englishQuotesRaw as QuoteData[];

export function useTestLifecycle() {
  const finishTestRef = useRef<() => void>(() => {});
  const { start: startTimer, stop: stopTimer, getElapsedMs } = useTestTimer(() => {
    finishTestRef.current();
  });
  const hasInitRef = useRef(false);

  const finishTest = useCallback(() => {
    stopTimer();
    const { words, wordInputs, currentInput, activeWordIndex } =
      useTypingStore.getState();
    useTypingStore.getState().finishTest();

    const elapsedMs = getElapsedMs();
    const elapsed = elapsedMs / 1000;
    const testEndTime = performance.now();
    const history = useInputHistoryStore.getState();

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
    const validation = validateResult(result, {
      mode: config.mode,
      wordCount: config.words,
      timeConfig: config.time,
    });

    useResultStore.getState().setResult({ ...result, validation });
  }, [stopTimer, getElapsedMs]);

  useEffect(() => {
    finishTestRef.current = finishTest;
  }, [finishTest]);

  const initTest = useCallback(() => {
    stopTimer();
    const config = useConfigStore.getState();
    let words: string[];

    switch (config.mode) {
      case "quote": {
        const { words: quoteWords } = generateQuoteWords(englishQuotes);
        words = quoteWords;
        break;
      }
      case "zen":
        words = generateWords(englishWords, 100, {
          punctuation: config.punctuation,
          numbers: config.numbers,
        });
        break;
      case "words":
        words = generateWords(englishWords, config.words, {
          punctuation: config.punctuation,
          numbers: config.numbers,
        });
        break;
      case "time":
      default:
        words = generateWords(englishWords, 200, {
          punctuation: config.punctuation,
          numbers: config.numbers,
        });
        break;
    }

    useTypingStore.getState().initTest(words);
    useInputHistoryStore.getState().reset();
    useResultStore.getState().clearResult();
  }, [stopTimer]);

  const restartTest = useCallback(() => {
    initTest();
  }, [initTest]);

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

  return { initTest, restartTest, finishTest, onFirstKeypress };
}
