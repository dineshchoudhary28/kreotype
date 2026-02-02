"use client";

import { useCallback, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { calculateBurst } from "@/core/stats-calculator";
import type { ReplayRecorder } from "@/core/replay";

// Keys to track for keydown/keyup timing (from Monkeytype test-input.ts keysToTrack)
const TRACKED_KEYS = new Set([
  "KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG", "KeyH", "KeyI",
  "KeyJ", "KeyK", "KeyL", "KeyM", "KeyN", "KeyO", "KeyP", "KeyQ", "KeyR",
  "KeyS", "KeyT", "KeyU", "KeyV", "KeyW", "KeyX", "KeyY", "KeyZ",
  "Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5",
  "Digit6", "Digit7", "Digit8", "Digit9",
  "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5",
  "Numpad6", "Numpad7", "Numpad8", "Numpad9",
  "NumpadAdd", "NumpadSubtract", "NumpadMultiply", "NumpadDivide", "NumpadDecimal",
  "Space", "Backspace", "Tab", "Enter",
  "Minus", "Equal", "BracketLeft", "BracketRight", "Backslash",
  "Semicolon", "Quote", "Backquote", "Comma", "Period", "Slash",
  "ShiftLeft", "ShiftRight", "CapsLock",
  "IntlBackslash", "IntlRo", "IntlYen",
]);

export function useTypingInput(
  onFirstKeypress: () => void,
  finishTest: () => void,
  replayRecorder?: ReplayRecorder
) {
  const store = useTypingStore;
  const historyStore = useInputHistoryStore;
  const composingRef = useRef(false);
  const shiftState = useRef({ left: false, right: false });
  const capsLockRef = useRef(false);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      const inputEl = e.currentTarget;
      const value = inputEl.value;
      const { isFinished, isActive } = store.getState();
      if (isFinished) return;
      if (!isActive && value.length > 0) {
        onFirstKeypress();
      }
      store.getState().setCurrentInput(value);
    },
    [onFirstKeypress, store]
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      const inputEl = e.currentTarget;
      const value = inputEl.value;
      const { isFinished, isActive, words, activeWordIndex, currentInput } = store.getState();
      const { stopOnError, lazyMode, quickEnd } = useConfigStore.getState();

      if (isFinished) return;

      if (!isActive && value.length > 0) {
        onFirstKeypress();
      }

      const targetWord = words[activeWordIndex] ?? "";
      const { difficulty } = useConfigStore.getState();

      // Lazy Mode: Normalize input and target
      let processedValue = value;
      let processedTarget = targetWord;
      if (lazyMode) {
        processedValue = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        processedTarget = targetWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      // Master Mode: Fail immediately on any error
      if (difficulty === "master") {
        const charIndex = processedValue.length - 1;
        if (processedValue.length > currentInput.length) {
          const targetChar = processedTarget[charIndex];
          const inputChar = processedValue[charIndex];
          if (!targetChar || inputChar !== targetChar) {
            finishTest();
            return;
          }
        }
      }

      if (stopOnError === "letter") {
        const lastChar = processedValue[processedValue.length - 1];
        const targetChar = processedTarget[processedValue.length - 1];
        if (processedValue.length > currentInput.length && (processedValue.length > processedTarget.length || lastChar !== targetChar)) {
          inputEl.value = currentInput;
          historyStore.getState().incrementIncorrect();
          historyStore.getState().incrementKeypressCount();
          return;
        }
      }

      if (stopOnError === "word" && processedValue.length > processedTarget.length) {
        inputEl.value = currentInput;
        return;
      }

      const now = performance.now();
      historyStore.getState().addKeypressTiming(now);
      historyStore.getState().incrementKeypressCount();

      if (processedValue.length > currentInput.length) {
        const newCharIndex = processedValue.length - 1;
        const targetChar = processedTarget[newCharIndex];
        const inputChar = processedValue[newCharIndex];
        if (inputChar === targetChar) {
          historyStore.getState().incrementCorrect();
          replayRecorder?.addEvent("correctLetter", inputChar);
        } else {
          historyStore.getState().incrementIncorrect();
          historyStore.getState().incrementErrorCount();
          replayRecorder?.addEvent("incorrectLetter", inputChar);
        }
      } else if (processedValue.length < currentInput.length) {
        // Backspace - record letter index for replay
        replayRecorder?.addEvent("setLetterIndex", processedValue.length);
      }

      store.getState().setCurrentInput(value);

      // --- Min Stats Checks ---
      const { minAccuracy, minSpeed } = useConfigStore.getState();
      const history = historyStore.getState();
      const { correct, incorrect } = history.accuracy;
      const totalChars = correct + incorrect;

      if (totalChars > 20) {
        if (minAccuracy > 0) {
          const currentAcc = (correct / totalChars) * 100;
          if (currentAcc < minAccuracy) {
            finishTest();
            return;
          }
        }
        if (minSpeed > 0 && history.testStartTime) {
          const elapsedMin = (performance.now() - history.testStartTime) / 60000;
          if (elapsedMin > 0.05) {
            const currentWpm = (correct / 5) / elapsedMin;
            if (currentWpm < minSpeed) {
              finishTest();
              return;
            }
          }
        }
      }

      // Check for test completion on last word
      const isLastWord = activeWordIndex === words.length - 1;
      const isCorrect = processedValue === processedTarget;
      const isLengthMatched = processedValue.length >= processedTarget.length;

      if (isLastWord && (isCorrect || (quickEnd && isLengthMatched))) {
        // Push the final burst stats
        const burstStart = history.currentBurstStart;
        if (burstStart !== null) {
          const burstTime = performance.now() - burstStart;
          const burst = calculateBurst(value.length, burstTime);
          history.pushBurst(burst);
        }

        // Track missed word if incorrect
        if (!isCorrect) {
          historyStore.getState().trackMissedWord(targetWord);
        }

        replayRecorder?.addEvent(isCorrect ? "submitCorrectWord" : "submitErrorWord");
        store.getState().submitWord();
        finishTest();

        // Force keyup for all held keys at test end
        forceAllKeyups();

        if (inputEl) inputEl.blur();
      }
    },
    [onFirstKeypress, store, historyStore, finishTest, replayRecorder]
  );

  const forceAllKeyups = useCallback(() => {
    const s = historyStore.getState();
    const now = performance.now();
    for (const code of s.keydownTimestamps.keys()) {
      s.recordKeyup(code, now);
    }
  }, [historyStore]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      // Caps lock detection
      if (e.getModifierState) {
        capsLockRef.current = e.getModifierState("CapsLock");
      }

      if (e.key === "Shift") {
        if (e.location === 1) shiftState.current.left = true;
        if (e.location === 2) shiftState.current.right = true;
      }

      // Opposite Shift Logic
      const { oppositeShiftMode } = useConfigStore.getState();
      if (oppositeShiftMode !== "off" && e.key.length === 1 && e.key.toUpperCase() === e.key && e.key.toLowerCase() !== e.key) {
        // Shifted letter detected
      }

      // Record keydown timing (only for tracked keys)
      if (TRACKED_KEYS.has(e.code)) {
        historyStore.getState().recordKeydown(e.code, performance.now());
      }

      const {
        isFinished,
        words,
        activeWordIndex,
        currentInput,
        wordInputs,
      } = store.getState();
      const { stopOnError, confidenceMode, freedomMode, strictSpace } = useConfigStore.getState();
      const history = historyStore.getState();

      if (isFinished) return;

      // Confidence mode: max = no backspace at all, on = no going back to prev word
      if (e.key === "Backspace" && confidenceMode === "max") {
        e.preventDefault();
        return;
      }

      // Ctrl+Backspace: delete entire word (ported from Monkeytype)
      if (e.key === "Backspace" && (e.ctrlKey || e.metaKey) && currentInput.length > 0) {
        e.preventDefault();
        store.getState().setCurrentInput("");
        e.currentTarget.value = "";
        replayRecorder?.addEvent("setLetterIndex", 0);
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (currentInput.length === 0) {
          if (strictSpace) {
            const newVal = currentInput + " ";
            store.getState().setCurrentInput(newVal);
            e.currentTarget.value = newVal;
          }
          return;
        }

        const targetWord = words[activeWordIndex] ?? "";
        const { difficulty } = useConfigStore.getState();

        // Expert Mode: Fail if submitting an incorrect word
        if (difficulty === "expert" && currentInput !== targetWord) {
          finishTest();
          return;
        }

        if (stopOnError === "word") {
          if (currentInput !== targetWord) return;
        }

        const burstStart = history.currentBurstStart;
        if (burstStart !== null) {
          const burstTime = performance.now() - burstStart;
          const burst = calculateBurst(currentInput.length, burstTime);
          history.pushBurst(burst);

          // Min Burst Check
          const { minBurst, minBurstMode } = useConfigStore.getState();
          if (minBurst > 0) {
            let threshold = minBurst;
            if (minBurstMode === "flex") {
              const extraChars = Math.max(0, currentInput.length - 5);
              threshold = minBurst * Math.pow(0.95, extraChars);
            }
            if (burst < threshold) {
              finishTest();
              return;
            }
          }
        }
        historyStore.getState().setBurstStart(performance.now());

        // Track missed words
        if (currentInput !== targetWord) {
          historyStore.getState().trackMissedWord(targetWord);
          replayRecorder?.addEvent("submitErrorWord");
        } else {
          replayRecorder?.addEvent("submitCorrectWord");
        }

        store.getState().submitWord();

        const { activeWordIndex: newActiveWordIndex } = store.getState();
        if (newActiveWordIndex >= words.length) {
          finishTest();
          forceAllKeyups();
        }

        e.currentTarget.value = "";
        return;
      }

      if (e.key === "Backspace" && currentInput.length === 0 && activeWordIndex > 0) {
        if (confidenceMode !== "off") return;

        const prevInput = wordInputs[wordInputs.length - 1] ?? "";
        const prevTarget = words[activeWordIndex - 1] ?? "";

        if (!freedomMode && prevInput === prevTarget) {
          return;
        }

        if (stopOnError === "word") return;

        e.preventDefault();
        store.setState({
          activeWordIndex: activeWordIndex - 1,
          currentInput: prevInput,
          wordInputs: wordInputs.slice(0, -1),
        });
        e.currentTarget.value = prevInput;
        replayRecorder?.addEvent("backWord");
      }
    },
    [store, historyStore, finishTest, forceAllKeyups, replayRecorder]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Shift") {
        if (e.location === 1) shiftState.current.left = false;
        if (e.location === 2) shiftState.current.right = false;
      }

      // Update caps lock state
      if (e.getModifierState) {
        capsLockRef.current = e.getModifierState("CapsLock");
      }

      if (TRACKED_KEYS.has(e.code)) {
        historyStore.getState().recordKeyup(e.code, performance.now());
      }
    },
    [historyStore]
  );

  return {
    handleInput,
    handleKeyDown,
    handleKeyUp,
    handleCompositionStart,
    handleCompositionEnd,
    capsLockRef,
  };
}