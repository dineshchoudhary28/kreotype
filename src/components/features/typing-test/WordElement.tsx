"use client";

import { memo } from "react";
import { CharState } from "@/types/test";
import { LetterElement } from "./LetterElement";

interface WordElementProps {
  word: string;
  input: string | undefined;
  isActive: boolean;
  isTyped: boolean;
}

export const WordElement = memo(function WordElement({ word, input, isActive, isTyped }: WordElementProps) {
  const typedInput = input ?? "";
  const letters: { char: string; state: CharState }[] = [];

  for (let i = 0; i < word.length; i++) {
    if (!isTyped && !isActive && typedInput.length === 0) {
      letters.push({ char: word[i], state: CharState.Untyped });
    } else if (i < typedInput.length) {
      letters.push({
        char: word[i],
        state: typedInput[i] === word[i] ? CharState.Correct : CharState.Incorrect,
      });
    } else if (isTyped) {
      letters.push({ char: word[i], state: CharState.Missed });
    } else {
      letters.push({ char: word[i], state: CharState.Untyped });
    }
  }

  // Extra characters beyond target word length
  if (typedInput.length > word.length) {
    for (let i = word.length; i < typedInput.length; i++) {
      letters.push({ char: typedInput[i], state: CharState.Extra });
    }
  }

  const errorUnderline = isTyped && typedInput !== word ? "border-b-2 border-[var(--error)]" : "";

  // Dim non-active words: typed words get reduced opacity, future words slightly less
  const opacityClass = isActive
    ? "opacity-100"
    : isTyped
      ? "opacity-100"
      : "opacity-60";

  return (
    <span className={`inline-block mr-[0.5em] ${errorUnderline} ${opacityClass} transition-opacity duration-200`} data-word>
      {letters.map((l, i) => (
        <LetterElement key={i} char={l.char} state={l.state} />
      ))}
    </span>
  );
});
