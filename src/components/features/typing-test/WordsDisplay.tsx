"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { WordElement } from "./WordElement";
import { Caret } from "@/components/ui/Caret";

export function WordsDisplay() {
  const words = useTypingStore((s) => s.words);
  const wordInputs = useTypingStore((s) => s.wordInputs);
  const currentInput = useTypingStore((s) => s.currentInput);
  const activeWordIndex = useTypingStore((s) => s.activeWordIndex);
  const isFinished = useTypingStore((s) => s.isFinished);
  const fontSize = useConfigStore((s) => s.fontSize);

  const containerRef = useRef<HTMLDivElement>(null);
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
  const [lineOffset, setLineOffset] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset lineOffset when words change (restart)
  useEffect(() => {
    // eslint-disable-next-line
    setLineOffset(0);
  }, [words]);

  // Derive isTyping from currentInput changes
  useEffect(() => {
    // eslint-disable-next-line
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [currentInput]);

  const updateCaretPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const wordEls = container.querySelectorAll("[data-word]");
    const activeWordEl = wordEls[activeWordIndex];
    if (!activeWordEl) return;

    const letterEls = activeWordEl.children;
    const charIndex = currentInput.length;
    const containerRect = container.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (charIndex < letterEls.length) {
      const letterRect = letterEls[charIndex].getBoundingClientRect();
      top = letterRect.top - containerRect.top;
      left = letterRect.left - containerRect.left;
    } else if (letterEls.length > 0) {
      const lastRect = letterEls[letterEls.length - 1].getBoundingClientRect();
      top = lastRect.top - containerRect.top;
      left = lastRect.right - containerRect.left;
    } else {
      const wordRect = activeWordEl.getBoundingClientRect();
      top = wordRect.top - containerRect.top;
      left = wordRect.left - containerRect.left;
    }

    setCaretPos({ top, left });

    // Scroll: keep active line within view (3 lines visible)
    const wordTop = activeWordEl.getBoundingClientRect().top - containerRect.top + lineOffset;
    const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || fontSize * 16 * 1.8;
    const targetLine = Math.floor(wordTop / lineHeight);
    if (targetLine > 1) {
      setLineOffset((targetLine - 1) * lineHeight);
    }
  }, [activeWordIndex, currentInput, fontSize, lineOffset]);

  useLayoutEffect(() => {
    // eslint-disable-next-line
    updateCaretPosition();
  }, [updateCaretPosition]);

  if (isFinished || words.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden font-mono leading-relaxed"
      style={{
        fontSize: `${fontSize}rem`,
        height: `${fontSize * 1.8 * 3}rem`,
      }}
    >
      <motion.div
        className="relative"
        animate={{ y: -lineOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {words.map((word, i) => (
          <WordElement
            key={`${i}-${word}`}
            word={word}
            input={
              i < activeWordIndex
                ? wordInputs[i]
                : i === activeWordIndex
                  ? currentInput
                  : undefined
            }
            isActive={i === activeWordIndex}
            isTyped={i < activeWordIndex}
          />
        ))}
      </motion.div>
      <Caret top={caretPos.top} left={caretPos.left} isTyping={isTyping} />
    </div>
  );
}
