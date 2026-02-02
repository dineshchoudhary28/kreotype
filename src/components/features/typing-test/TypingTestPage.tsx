"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingStore } from "@/store/useTypingStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useTestLifecycle } from "@/hooks/useTestLifecycle";
import { useTypingInput } from "@/hooks/useTypingInput";
import { useTypingSound } from "@/hooks/useTypingSound";
import { useFocusManager } from "@/hooks/useFocusManager";
import { WordsDisplay } from "./WordsDisplay";
import { HiddenInput } from "./HiddenInput";
import { TestConfig } from "./TestConfig";
import { TestResult } from "./TestResult";
import { LiveStat } from "@/components/ui/LiveStat";
import { TimerProgress } from "@/components/ui/TimerProgress";
import { OutOfFocusWarning } from "@/components/ui/OutOfFocusWarning";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { CapsWarning } from "@/components/ui/CapsWarning";

export function TypingTestPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFinished = useTypingStore((s) => s.isFinished);
  const testId = useTypingStore((s) => s.testId);
  const liveSpeedStyle = useConfigStore((s) => s.liveSpeedStyle);
  const liveAccStyle = useConfigStore((s) => s.liveAccStyle);
  const liveBurstStyle = useConfigStore((s) => s.liveBurstStyle);
  const quickRestart = useConfigStore((s) => s.quickRestart);
  const [capsLock, setCapsLock] = useState(false);

  const mode = useConfigStore((s) => s.mode);
  const { initTest, restartTest, finishTest, onFirstKeypress, replayRecorder } = useTestLifecycle();
  const { handleInput, handleKeyDown, handleKeyUp, handleCompositionStart, handleCompositionEnd, capsLockRef } = useTypingInput(onFirstKeypress, finishTest, replayRecorder);
  const { showWarning, focusInput, handleFocus, handleBlur } =
    useFocusManager(inputRef);
  useTypingSound();

  const doRestart = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    restartTest();
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [restartTest]);

  const doRepeat = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    useTypingStore.getState().setRepeated(true);
    initTest();
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [initTest]);

  const doPractice = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    const missed = useInputHistoryStore.getState().missedWords;
    const practiceWords = Object.keys(missed);
    if (practiceWords.length === 0) {
      doRestart();
      return;
    }
    // Repeat missed words enough to fill a reasonable test
    const repeated: string[] = [];
    while (repeated.length < Math.max(practiceWords.length, 25)) {
      repeated.push(...practiceWords);
    }
    useTypingStore.getState().initTest(repeated.slice(0, Math.max(practiceWords.length, 25)));
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [doRestart]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Caps lock detection
      setCapsLock(e.getModifierState("CapsLock"));

      // Zen mode: Shift+Enter finishes the test
      if (mode === "zen" && e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        finishTest();
        return;
      }

      if (quickRestart === "off") return;
      
      // Disable quick restart when showing results to allow navigation
      if (isFinished) return;

      if (
        (quickRestart === "tab" && e.key === "Tab") ||
        (quickRestart === "esc" && e.key === "Escape") ||
        (quickRestart === "enter" && e.key === "Enter")
      ) {
        e.preventDefault();
        doRestart();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [doRestart, quickRestart, mode, finishTest, isFinished]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isFinished]);

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto gap-6 px-4">
      <CommandPalette onRestart={doRestart} />

      <AnimatePresence mode="wait">
        {!isFinished && (
          <motion.div
            key="test"
            className="flex flex-col items-center w-full gap-6 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TestConfig onRestart={doRestart} />

            <div className="flex items-center gap-4 min-h-[2rem]">
              <TimerProgress />
              <LiveStat type="wpm" style={liveSpeedStyle} />
              <LiveStat type="accuracy" style={liveAccStyle} />
              <LiveStat type="burst" style={liveBurstStyle} />
            </div>

            <div className="relative w-full">
              <OutOfFocusWarning show={showWarning} onClick={focusInput} />
              <WordsDisplay key={testId} />
              <HiddenInput
                ref={inputRef}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
              />
              <CapsWarning capsLockOn={capsLock} />
            </div>
          </motion.div>
        )}

        {isFinished && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TestResult onRestart={doRestart} onRepeat={doRepeat} onPractice={doPractice} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
