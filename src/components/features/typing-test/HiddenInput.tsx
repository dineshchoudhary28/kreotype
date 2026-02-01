"use client";

import { forwardRef } from "react";

interface HiddenInputProps {
  onInput: (e: React.FormEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onCompositionStart?: () => void;
  onCompositionEnd?: (e: React.CompositionEvent<HTMLInputElement>) => void;
}

export const HiddenInput = forwardRef<HTMLInputElement, HiddenInputProps>(
  function HiddenInput({ onInput, onKeyDown, onKeyUp, onFocus, onBlur, onCompositionStart, onCompositionEnd }, ref) {
    return (
      <input
        ref={ref}
        className="absolute opacity-0 w-0 h-0 -z-10"
        type="text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        tabIndex={0}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
      />
    );
  }
);
