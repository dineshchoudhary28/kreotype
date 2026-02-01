"use client";

import { useRef, useCallback } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useConfigStore } from "@/store/useConfigStore";
import { countChars } from "@/core/char-counter";
import { calculateWpmAndRaw } from "@/core/stats-calculator";
import { createTestTimer, type TestTimer } from "@/core/timer";

export function useTestTimer(onFinish: () => void) {
  const timerRef = useRef<TestTimer | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;

    const { mode, time: maxTime } = useConfigStore.getState();
    const maxSeconds = mode === "time" ? maxTime : undefined;

    timerRef.current = createTestTimer(
      (elapsed) => {
        const { words, wordInputs, currentInput, activeWordIndex } =
          useTypingStore.getState();
        const history = useInputHistoryStore.getState();

        const chars = countChars(words, wordInputs, currentInput, activeWordIndex);
        const { wpm, raw } = calculateWpmAndRaw(
          chars.correctWordChars,
          chars.correctSpaces,
          chars.allCharsTyped,
          elapsed
        );

        history.pushSecondStats(wpm, raw, history.currentErrorCount, history.currentKeypressCount);
      },
      () => {
        onFinish();
      },
      maxSeconds
    );

    timerRef.current.start();
  }, [onFinish]);

  const stop = useCallback(() => {
    timerRef.current?.stop();
    timerRef.current = null;
  }, []);

  const getElapsedMs = useCallback(() => {
    return timerRef.current?.getElapsedMs() ?? 0;
  }, []);

  return { start, stop, getElapsedMs };
}
