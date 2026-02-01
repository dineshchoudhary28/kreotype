"use client";

import { memo } from "react";
import { CharState } from "@/types/test";

const charStateClasses: Record<CharState, string> = {
  [CharState.Correct]: "text-text",
  [CharState.Incorrect]: "text-error",
  [CharState.Extra]: "text-error-extra opacity-70",
  [CharState.Missed]: "text-text opacity-50",
  [CharState.Untyped]: "text-secondary",
};

interface LetterElementProps {
  char: string;
  state: CharState;
}

export const LetterElement = memo(function LetterElement({ char, state }: LetterElementProps) {
  return (
    <span className={`${charStateClasses[state]} transition-colors duration-150`}>
      {char}
    </span>
  );
});
