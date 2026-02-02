"use client";

import { memo } from "react";
import { CharState } from "@/types/test";
import { useConfigStore } from "@/store/useConfigStore";

const charStateClasses: Record<CharState, string> = {
  [CharState.Correct]: "text-text",
  [CharState.Incorrect]: "text-error",
  [CharState.Extra]: "text-error-extra opacity-70",
  [CharState.Missed]: "text-text opacity-50",
  [CharState.Untyped]: "text-secondary",
};

const colorfulCharStateClasses: Record<CharState, string> = {
  [CharState.Correct]: "text-[#7ec874]",
  [CharState.Incorrect]: "text-[#e06c75]",
  [CharState.Extra]: "text-[#e06c75] opacity-50",
  [CharState.Missed]: "text-[#e5c07b]",
  [CharState.Untyped]: "text-secondary",
};

interface LetterElementProps {
  char: string;
  state: CharState;
  typedChar?: string;
}

export const LetterElement = memo(function LetterElement({ char, state, typedChar }: LetterElementProps) {
  const indicateTypos = useConfigStore((s) => s.indicateTypos);
  const colorfulMode = useConfigStore((s) => s.colorfulMode);
  const classes = colorfulMode ? colorfulCharStateClasses : charStateClasses;
  const isError = state === CharState.Incorrect || state === CharState.Extra;

  let displayChar = char;
  let subChar: string | null = null;

  if (isError && typedChar) {
    if (indicateTypos === "replace") {
      displayChar = typedChar;
    } else if (indicateTypos === "below") {
      subChar = typedChar;
    } else if (indicateTypos === "both") {
      displayChar = typedChar;
      subChar = char; // Show correct letter below
    }
  }

  return (
    <span className="relative inline-flex flex-col items-center group">
      <span className={`${classes[state]} transition-colors duration-150`}>
        {displayChar}
      </span>
      {subChar && (
        <span className="absolute top-full left-0 text-[0.5em] leading-none text-secondary opacity-70">
          {subChar}
        </span>
      )}
    </span>
  );
});
