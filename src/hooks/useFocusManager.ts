"use client";

import { useState, useCallback, useEffect, useRef, type RefObject } from "react";
import { useTypingStore } from "@/store/useTypingStore";

export function useFocusManager(inputRef: RefObject<HTMLInputElement | null>) {
  const [isFocused, setIsFocused] = useState(true);
  const isActive = useTypingStore((s) => s.isActive);
  const isFocusedRef = useRef(true);
  const isActiveRef = useRef(false);

  // Keep refs in sync to avoid re-registering listeners
  useEffect(() => {
    isFocusedRef.current = isFocused;
    isActiveRef.current = isActive;
  }, [isFocused, isActive]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  useEffect(() => {
    const handleClick = () => focusInput();
    const handleKeyDown = () => {
      if (!isFocusedRef.current && isActiveRef.current) {
        focusInput();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusInput]);

  const showWarning = isActive && !isFocused;

  return { isFocused, showWarning, focusInput, handleFocus, handleBlur };
}
