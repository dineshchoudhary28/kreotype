"use client";

import { useRef, useCallback } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useConfigStore } from "@/store/useConfigStore";
import { countChars } from "@/core/char-counter";
import { calculateWpmAndRaw } from "@/core/stats-calculator";
import { createTestTimer, type TestTimer } from "@/core/timer";

const SLOW_TIMER_DRIFT_WARN = 125;
const SLOW_TIMER_DRIFT_FAIL = 500;
const SLOW_TIMER_MAX_CONSECUTIVE = 5;

export function useTestTimer(onFinish: () => void) {
  const timerRef = useRef<TestTimer | null>(null);
  const slowTimerCountRef = useRef(0);

  const start = useCallback(() => {
    if (timerRef.current) return;
    slowTimerCountRef.current = 0;

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

        // Push per-second stats including AFK detection
        const keypresses = history.currentKeypressCount;
        history.pushSecondStats(wpm, raw, history.currentErrorCount, keypresses);
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
    slowTimerCountRef.current = 0;
  }, []);

  const getElapsedMs = useCallback(() => {
    return timerRef.current?.getElapsedMs() ?? 0;
  }, []);

  return { start, stop, getElapsedMs };
}
