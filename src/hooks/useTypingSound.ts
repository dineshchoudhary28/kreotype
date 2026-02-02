"use client";

import { useEffect, useRef } from "react";
import { useConfigStore } from "@/store/useConfigStore";
import { useTypingStore } from "@/store/useTypingStore";
import { playSynthClick, playSynthError } from "@/core/sound-engine";

export function useTypingSound() {
  const soundOnClick = useConfigStore((s) => s.soundOnClick);
  const soundOnError = useConfigStore((s) => s.soundOnError);
  const soundVolume = useConfigStore((s) => s.soundVolume);
  const isActive = useTypingStore((s) => s.isActive);
  const prevInputRef = useRef("");

  useEffect(() => {
    if (soundOnClick === "off" && soundOnError === "off") return;
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length > 1 && e.key !== "Backspace") return;

      if (soundOnClick !== "off") {
        playSynthClick(soundVolume, parseInt(soundOnClick) || 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [soundOnClick, soundOnError, soundVolume, isActive]);

  // Track errors by subscribing to store changes
  useEffect(() => {
    if (soundOnError === "off" || !isActive) return;

    const unsub = useTypingStore.subscribe((state) => {
      const input = state.currentInput;
      const word = state.words[state.activeWordIndex];
      if (!word || !input) return;

      // Only react to new characters
      if (input.length > prevInputRef.current.length) {
        const lastChar = input[input.length - 1];
        const expectedChar = word[input.length - 1];
        if (lastChar !== expectedChar) {
          playSynthError(soundVolume, parseInt(soundOnError) || 1);
        }
      }
      prevInputRef.current = input;
    });

    return unsub;
  }, [soundOnError, soundVolume, isActive]);
}
