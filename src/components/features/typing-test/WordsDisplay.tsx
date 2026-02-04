"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { WordElement } from "./WordElement";
import { Caret } from "@/components/ui/Caret";

const WORD_BUFFER_SIZE = 100;

interface WordsDisplayProps {
  showHistory?: boolean;
}

export function WordsDisplay({ showHistory = false }: WordsDisplayProps) {
  const words = useTypingStore((s) => s.words);
  const wordInputs = useTypingStore((s) => s.wordInputs);
  const currentInput = useTypingStore((s) => s.currentInput);
  const activeWordIndex = useTypingStore((s) => s.activeWordIndex);
  const isFinished = useTypingStore((s) => s.isFinished);
  const isLanguageRTL = useTypingStore((s) => s.isLanguageRTL);
  const fontSize = useConfigStore((s) => s.fontSize);
  const smoothLineScroll = useConfigStore((s) => s.smoothLineScroll);
  const paceCaretCustomSpeed = useConfigStore((s) => s.paceCaretCustomSpeed);

  const containerRef = useRef<HTMLDivElement>(null);
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
  const [paceCaretPos, setPaceCaretPos] = useState({ top: 0, left: 0 });
  const [lineOffset, setLineOffset] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const paceCaretAnimRef = useRef<number>(0);
  const paceCaretStartRef = useRef<number>(0);
  const isTestActive = useTypingStore((s) => s.isActive);

  // Precompute cumulative character positions for pace caret (O(log n) binary search)
  const wordCharPositions = useMemo(() => {
    const positions: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < words.length; i++) {
      cumulative += words[i].length + 1; // +1 for space
      positions.push(cumulative);
    }
    return positions;
  }, [words]);

  // Word buffer: only render words within a window around the active word
  const { startIdx, endIdx } = useMemo(() => {
    const start = Math.max(0, activeWordIndex - 10);
    const end = Math.min(words.length, activeWordIndex + WORD_BUFFER_SIZE);
    return { startIdx: start, endIdx: end };
  }, [activeWordIndex, words.length]);

  // Derive isTyping from currentInput changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [currentInput]);

  const updateCaretPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const wordEls = container.querySelectorAll("[data-word]");
    // Adjust for buffer offset
    const adjustedIndex = activeWordIndex - startIdx;
    const activeWordEl = wordEls[adjustedIndex] as HTMLElement;
    if (!activeWordEl) return;

    const letterEls = activeWordEl.children;
    const charIndex = currentInput.length;

    let top = 0;
    let left = 0;

    if (charIndex < letterEls.length) {
      const letterEl = letterEls[charIndex] as HTMLElement;
      top = letterEl.offsetTop;
      left = isLanguageRTL
        ? letterEl.offsetLeft + letterEl.offsetWidth
        : letterEl.offsetLeft;
    } else if (letterEls.length > 0) {
      const lastEl = letterEls[letterEls.length - 1] as HTMLElement;
      top = lastEl.offsetTop;
      left = isLanguageRTL
        ? lastEl.offsetLeft
        : lastEl.offsetLeft + lastEl.offsetWidth;
    } else {
      top = activeWordEl.offsetTop;
      left = activeWordEl.offsetLeft;
    }

    setCaretPos({ top, left });

    // Scroll: keep active line within view (3 lines visible)
    const wordTop = activeWordEl.offsetTop;
    const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || fontSize * 16 * 1.8;
    const targetLine = Math.floor(wordTop / lineHeight);

    if (targetLine > 1) {
      setLineOffset((targetLine - 1) * lineHeight);
    } else {
      setLineOffset(0);
    }
  }, [activeWordIndex, currentInput, fontSize, startIdx, isLanguageRTL]);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateCaretPosition();
  }, [updateCaretPosition]);

  // Pace caret: advance through character positions at a fixed WPM rate
  useEffect(() => {
    if (!paceCaretCustomSpeed || paceCaretCustomSpeed <= 0 || showHistory || isFinished || !isTestActive) {
      cancelAnimationFrame(paceCaretAnimRef.current);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // chars per ms = (wpm * 5) / 60000
    const charsPerMs = (paceCaretCustomSpeed * 5) / 60000;
    paceCaretStartRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - paceCaretStartRef.current;
      const charIndex = Math.floor(elapsed * charsPerMs);

      // Binary search for word index based on character position
      let left = 0;
      let right = wordCharPositions.length - 1;
      let wordIdx = 0;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const prevPos = mid === 0 ? 0 : wordCharPositions[mid - 1];
        const currPos = wordCharPositions[mid];

        if (charIndex >= prevPos && charIndex < currPos) {
          wordIdx = mid;
          break;
        }
        if (charIndex < prevPos) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      // Calculate character position within the word
      const prevCumulative = wordIdx === 0 ? 0 : wordCharPositions[wordIdx - 1];
      const charInWord = charIndex - prevCumulative;

      // Find the DOM element
      const wordEls = container.querySelectorAll("[data-word]");
      const relativeIdx = wordIdx - startIdx;

      if (relativeIdx >= 0 && relativeIdx < wordEls.length) {
        const el = wordEls[relativeIdx] as HTMLElement;
        const letterEls = el.children;
        const ci = Math.min(charInWord, letterEls.length - 1);
        if (ci >= 0 && letterEls[ci]) {
          const letterEl = letterEls[ci] as HTMLElement;
          setPaceCaretPos({ top: letterEl.offsetTop, left: letterEl.offsetLeft });
        }
        paceCaretAnimRef.current = requestAnimationFrame(tick);
      }
    };

    paceCaretAnimRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(paceCaretAnimRef.current);
  }, [
    paceCaretCustomSpeed,
    showHistory,
    isFinished,
    isTestActive,
    words,
    startIdx,
    wordCharPositions,
  ]);

  if ((isFinished && !showHistory) || words.length === 0) return null;

  const lineTransition = smoothLineScroll
    ? { type: "spring" as const, stiffness: 300, damping: 30 }
    : { duration: 0.15 };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden font-mono leading-relaxed ${showHistory ? 'opacity-80' : ''}`}
      style={{
        fontSize: `${fontSize}rem`,
        height: `${fontSize * 1.8 * 3}rem`,
        direction: isLanguageRTL ? "rtl" : "ltr",
      }}
    >
      <motion.div
        className="relative"
        animate={{ y: -lineOffset }}
        transition={lineTransition}
      >
        {words.slice(startIdx, endIdx).map((word, i) => {
          const globalIdx = startIdx + i;
          return (
            <WordElement
              key={`${globalIdx}-${word}`}
              word={word}
              input={
                globalIdx < activeWordIndex
                  ? wordInputs[globalIdx]
                  : globalIdx === activeWordIndex
                    ? currentInput
                    : undefined
              }
              isActive={!showHistory && globalIdx === activeWordIndex}
              isTyped={globalIdx < activeWordIndex || (showHistory && globalIdx < wordInputs.length)}
            />
          );
        })}
        {!showHistory && <Caret top={caretPos.top} left={caretPos.left} isTyping={isTyping} />}
        {!showHistory && paceCaretCustomSpeed > 0 && isTestActive && (
          <Caret top={paceCaretPos.top} left={paceCaretPos.left} isPaceCaret />
        )}
      </motion.div>
    </div>
  );
}
