"use client";

import { useCallback, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { calculateBurst } from "@/core/stats-calculator";

export function useTypingInput(onFirstKeypress: () => void) {
  const store = useTypingStore;
  const historyStore = useInputHistoryStore;
  const composingRef = useRef(false);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      // Process the composed text as a single input event
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
      if (composingRef.current) return; // Skip during IME composition

      const inputEl = e.currentTarget;
      const value = inputEl.value;
      const { isFinished, isActive, words, activeWordIndex, currentInput } = store.getState();
      const { stopOnError } = useConfigStore.getState();

      if (isFinished) return;

      if (!isActive && value.length > 0) {
        onFirstKeypress();
      }

      const targetWord = words[activeWordIndex] ?? "";

      if (stopOnError === "letter") {
        const lastChar = value[value.length - 1];
        const targetChar = targetWord[value.length - 1];
        if (value.length > currentInput.length && (value.length > targetWord.length || lastChar !== targetChar)) {
          inputEl.value = currentInput;
          historyStore.getState().incrementIncorrect();
          historyStore.getState().incrementKeypressCount();
          return;
        }
      }

      if (stopOnError === "word" && value.length > targetWord.length) {
        inputEl.value = currentInput;
        return;
      }

      const now = performance.now();
      historyStore.getState().addKeypressTiming(now);
      historyStore.getState().incrementKeypressCount();

      if (value.length > currentInput.length) {
        const newCharIndex = value.length - 1;
        const targetChar = targetWord[newCharIndex];
        const inputChar = value[newCharIndex];
        if (inputChar === targetChar) {
          historyStore.getState().incrementCorrect();
        } else {
          historyStore.getState().incrementIncorrect();
          historyStore.getState().incrementErrorCount();
        }
      }

      store.getState().setCurrentInput(value);
    },
    [onFirstKeypress, store, historyStore]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composingRef.current) return;

      // Record keydown timing
      historyStore.getState().recordKeydown(e.code, performance.now());

      const {
        isFinished,
        words,
        activeWordIndex,
        currentInput,
        wordInputs,
      } = store.getState();
      const { stopOnError, confidenceMode } = useConfigStore.getState();
      const history = historyStore.getState();

      if (isFinished) return;

      // Confidence mode: max = no backspace at all, on = no going back to prev word
      if (e.key === "Backspace" && confidenceMode === "max") {
        e.preventDefault();
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (currentInput.length === 0) return;

        const targetWord = words[activeWordIndex] ?? "";

        if (stopOnError === "word") {
          if (currentInput !== targetWord) return;
        }

        const burstStart = history.currentBurstStart;
        if (burstStart !== null) {
          const burstTime = performance.now() - burstStart;
          const burst = calculateBurst(currentInput.length, burstTime);
          history.pushBurst(burst);
        }
        historyStore.getState().setBurstStart(performance.now());

        store.getState().submitWord();

        const { activeWordIndex: newActiveWordIndex } = store.getState();
        if (newActiveWordIndex >= words.length) {
          store.getState().finishTest();
        }

        e.currentTarget.value = "";
        return;
      }

      if (e.key === "Backspace" && currentInput.length === 0 && activeWordIndex > 0) {
        if (stopOnError === "word" || confidenceMode !== "off") return;
        e.preventDefault();
        const prevInput = wordInputs[wordInputs.length - 1] ?? "";
        store.setState({
          activeWordIndex: activeWordIndex - 1,
          currentInput: prevInput,
          wordInputs: wordInputs.slice(0, -1),
        });
        e.currentTarget.value = prevInput;
      }
    },
    [store, historyStore]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      historyStore.getState().recordKeyup(e.code, performance.now());
    },
    [historyStore]
  );

  return { handleInput, handleKeyDown, handleKeyUp, handleCompositionStart, handleCompositionEnd };
}
