"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useConfigStore } from "@/store/useConfigStore";
import { useTypingTestStore, WordData } from "@/store/useTypingTestStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { TestResults } from "./TestResults";
import englishWords from "@/data/languages/english.json";
import englishQuotes from "@/data/quotes/english.json";

const punctuationMarks = [".", ",", "!", "?", ";", ":"];

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateWords(
  mode: string,
  value: string,
  punctuation: boolean,
  numbers: boolean
): string[] {
  let words: string[] = [];

  if (mode === "quote") {
    // Filter quotes by group
    let filteredQuotes = englishQuotes;
    if (value !== "all") {
      filteredQuotes = englishQuotes.filter((q) => q.group === value);
    }
    if (filteredQuotes.length === 0) {
      filteredQuotes = englishQuotes;
    }
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    words = quote.text.split(" ");
  } else if (mode === "zen") {
    // Zen mode: infinite words, we'll generate a batch
    words = shuffleArray(englishWords).slice(0, 100);
  } else if (mode === "time" || mode === "words") {
    // Generate enough words for the mode
    const wordCount = mode === "words" ? parseInt(value, 10) : 200;
    words = [];
    const shuffled = shuffleArray(englishWords);
    for (let i = 0; i < wordCount; i++) {
      words.push(shuffled[i % shuffled.length]);
    }
  } else {
    // Custom or fallback
    words = shuffleArray(englishWords).slice(0, 50);
  }

  // Apply punctuation
  if (punctuation && mode !== "quote") {
    words = words.map((word, i) => {
      if (Math.random() < 0.15) {
        const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        return word + mark;
      }
      // Capitalize first word and words after sentence-ending punctuation
      if (i === 0 || (i > 0 && /[.!?]$/.test(words[i - 1]))) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });
  }

  // Apply numbers
  if (numbers && mode !== "quote") {
    words = words.map((word) => {
      if (Math.random() < 0.1) {
        return Math.floor(Math.random() * 1000).toString();
      }
      return word;
    });
  }

  return words;
}

export function TypingTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for input focus
  const [isInputFocused, setIsInputFocused] = useState(true);

  // Config store
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const language = useConfigStore((s) => s.language);
  const lineMode = useConfigStore((s) => s.lineMode);

  // Typing test store
  const words = useTypingTestStore((s) => s.words);
  const currentWordIndex = useTypingTestStore((s) => s.currentWordIndex);
  const currentCharIndex = useTypingTestStore((s) => s.currentCharIndex);
  const isActive = useTypingTestStore((s) => s.isActive);
  const isFinished = useTypingTestStore((s) => s.isFinished);
  const timeLeft = useTypingTestStore((s) => s.timeLeft);
  const stats = useTypingTestStore((s) => s.stats);
  const isPaused = useTypingTestStore((s) => s.isPaused);
  const setWords = useTypingTestStore((s) => s.setWords);
  const handleInput = useTypingTestStore((s) => s.handleInput);
  const handleBackspace = useTypingTestStore((s) => s.handleBackspace);
  const handleSpace = useTypingTestStore((s) => s.handleSpace);
  const resetTest = useTypingTestStore((s) => s.resetTest);
  const tick = useTypingTestStore((s) => s.tick);
  const setTimeLeft = useTypingTestStore((s) => s.setTimeLeft);
  const incrementBlur = useTypingTestStore((s) => s.incrementBlur);
  const incrementTab = useTypingTestStore((s) => s.incrementTab);
  const setPaused = useTypingTestStore((s) => s.setPaused);

  // Focus mode store
  const setFocused = useFocusModeStore((s) => s.setFocused);

  // Initialize words on mount or config change
  const initializeTest = useCallback(() => {
    const newWords = generateWords(mode, value, punctuation, numbers);
    setWords(newWords);
    if (mode === "time") {
      setTimeLeft(parseInt(value, 10));
    }
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [mode, value, punctuation, numbers, setWords, setTimeLeft]);

  useEffect(() => {
    setTimeout(() => initializeTest(), 0);
  }, [initializeTest]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused, tick]);

  // Focus mode when typing
  useEffect(() => {
    setFocused(isActive);
  }, [isActive, setFocused]);

  // Cheating detection: window blur (alt+tab, switching windows)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        incrementBlur();
        setPaused(true);
      } else if (!document.hidden && isPaused) {
        setPaused(false);
        inputRef.current?.focus();
      }
    };

    const handleWindowBlur = () => {
      if (isActive) {
        incrementBlur();
        setPaused(true);
      }
    };

    const handleWindowFocus = () => {
      if (isPaused) {
        setPaused(false);
        inputRef.current?.focus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isActive, isPaused, incrementBlur, setPaused]);

  // Scroll to current word
  useEffect(() => {
    if (wordsContainerRef.current && lineMode === "multi") {
      const currentWordEl = wordsContainerRef.current.querySelector(
        `[data-word-index="${currentWordIndex}"]`
      );
      if (currentWordEl) {
        const container = wordsContainerRef.current;
        const wordRect = currentWordEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Check if word is below visible area
        if (wordRect.top > containerRect.top + containerRect.height * 0.6) {
          currentWordEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentWordIndex, lineMode]);

  // Global keydown listener to refocus input when blurred
  useEffect(() => {
    const handleGlobalKeyDown = () => {
      if (!isInputFocused && !isFinished) {
        // Any key press refocuses the input
        inputRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isInputFocused, isFinished]);

  // Track Tab key state for Tab+Enter restart
  const tabPressedRef = useRef(false);

  // Handle keyboard events - sync (no async handlers for input)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Block Alt key combinations (cheating prevention)
      if (e.altKey) {
        e.preventDefault();
        if (isActive) {
          incrementTab();
        }
        return;
      }

      // Track Tab key press
      if (e.key === "Tab") {
        e.preventDefault();
        if (isFinished) {
          initializeTest();
          resetTest();
        } else {
          tabPressedRef.current = true;
        }
        return;
      }

      // Tab + Enter to restart (legacy support or extra shortcut)
      if (e.key === "Enter" && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
        initializeTest();
        resetTest();
        return;
      }

      // Escape to reset/restart test
      if (e.key === "Escape") {
        e.preventDefault();
        tabPressedRef.current = false;
        if (isFinished) {
          // Restart same test (or just reset)
          resetTest();
          inputRef.current?.focus();
        } else {
          resetTest();
        }
        return;
      }

      if (isFinished || isPaused) return;

      // Space to move to next word
      if (e.key === " ") {
        e.preventDefault();
        handleSpace();
        return;
      }

      // Backspace
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Regular character input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleInput(e.key);
      }
    },
    [isFinished, isPaused, isActive, handleInput, handleBackspace, handleSpace, initializeTest, resetTest, incrementTab]
  );

  // Reset tab state on key up
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      tabPressedRef.current = false;
    }
  }, []);

  // Block copy/paste (cheating prevention)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);

  const handleCopy = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);

  // Handle input focus/blur
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  // Restart handlers
  const handleRestart = useCallback(() => {
    resetTest();
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [resetTest]);

  const handleNext = useCallback(() => {
    initializeTest();
    resetTest();
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [initializeTest, resetTest]);

  // Focus container on click (for blur overlay)
  const handleBlurOverlayClick = useCallback(() => {
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, []);

  // Show results if finished
  if (isFinished && stats) {
    return <TestResults stats={stats} onRestart={handleRestart} onNext={handleNext} />;
  }

  // Get display info based on mode
  const getTestInfo = () => {
    if (mode === "time") {
      return <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">{timeLeft}</span>;
    }
    if (mode === "words") {
      const totalWords = parseInt(value, 10);
      return (
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {currentWordIndex}/{totalWords}
        </span>
      );
    }
    if (mode === "quote") {
      return (
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {currentWordIndex}/{words.length}
        </span>
      );
    }
    // Zen mode - just show word count
    return (
      <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
        {currentWordIndex}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col justify-center outline-none relative px-4 md:px-0"
    >
      {/* Hidden input for keyboard capture */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Language Indicator (hidden when typing) OR Test Info (when typing) */}
      <div className="flex items-center justify-center w-full max-w-[1500px] mx-auto px-2 h-10 md:h-12">
        {isActive ? (
          // Show timer/word count when active
          <div className="flex items-center gap-6">
            {getTestInfo()}
          </div>
        ) : (
          // Show language when not active - centered
          <div className="flex items-center gap-2 text-secondary text-[10px] md:text-xs font-medium cursor-pointer hover:text-text transition-colors group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:text-primary transition-colors"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {language}
          </div>
        )}
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center px-6">
            <div className="text-xl md:text-2xl font-bold text-primary mb-4">Test Paused</div>
            <div className="text-secondary text-sm md:text-base">Click here or press any key to continue</div>
          </div>
        </div>
      )}

      {/* Typing Text Display */}
      <div
        ref={wordsContainerRef}
        className={`mt-4 md:mt-8 relative w-full max-w-[1500px] mx-auto ${
          lineMode === "single" ? "overflow-hidden whitespace-nowrap" : "overflow-hidden"
        }`}
        style={{ maxHeight: lineMode === "multi" ? "200px" : "auto" }}
      >
        {/* Blur overlay when input not focused */}
        {!isInputFocused && (
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center cursor-pointer rounded-lg px-6"
            onClick={handleBlurOverlayClick}
          >
            <div className="text-secondary text-base md:text-lg text-center">Click here or press any key to focus</div>
          </div>
        )}

        <div
          className={`text-2xl md:text-3xl leading-relaxed font-['Inter'] tracking-wide ${
            lineMode === "single" ? "flex gap-2 md:gap-3" : "flex flex-wrap gap-x-2 md:gap-x-3 gap-y-1 md:gap-y-2"
          }`}
        >
          {words.map((wordData, wordIndex) => (
            <Word
              key={wordIndex}
              wordData={wordData}
              wordIndex={wordIndex}
              isCurrentWord={wordIndex === currentWordIndex}
              currentCharIndex={wordIndex === currentWordIndex ? currentCharIndex : -1}
              showCursor={isInputFocused}
            />
          ))}
        </div>
      </div>

      {/* Restart Button - Always visible */}
      <div className="mt-12 md:mt-20 flex flex-col items-center gap-4 md:gap-6 pb-8 md:pb-12">
        <button
          className="text-secondary hover:text-text transition-colors cursor-pointer p-2 rounded-lg hover:bg-surface group"
          title="Restart Test (Tab + Enter)"
          onClick={() => {
            initializeTest();
            resetTest();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:rotate-45 transition-transform duration-300"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <polyline points="21 3 21 8 16 8" />
          </svg>
        </button>

        {/* Shortcuts - hidden on touch devices ideally, but here just shown as small text */}
        {!isActive && (
          <div className="flex gap-4 sm:gap-8 text-secondary text-[10px] md:text-[11px] font-medium opacity-50">
            <div className="flex items-center gap-1.5 md:gap-2">
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-surface text-secondary font-sans">
                tab
              </kbd>
              <span className="hidden sm:inline">+</span>
              <kbd className="bg-surface px-1.5 py-0.5 rounded border border-surface text-secondary font-sans hidden sm:inline">
                enter
              </kbd>
              <span>restart test</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface WordProps {
  wordData: WordData;
  wordIndex: number;
  isCurrentWord: boolean;
  currentCharIndex: number;
  showCursor: boolean;
}

function Word({ wordData, wordIndex, isCurrentWord, currentCharIndex, showCursor }: WordProps) {
  const isWordIncorrect = wordData.isCorrect === false;

  return (
    <span
      data-word-index={wordIndex}
      className={`relative inline-block ${isWordIncorrect ? "border-b-2 border-error" : ""}`}
    >
      {wordData.chars.map((charData, charIndex) => {
        const isCursor = isCurrentWord && charIndex === currentCharIndex && showCursor;

        let colorClass = "text-secondary"; // pending
        if (charData.state === "correct") {
          colorClass = "text-text";
        } else if (charData.state === "incorrect") {
          colorClass = "text-error";
        } else if (charData.state === "extra") {
          colorClass = "text-error opacity-70";
        }

        return (
          <span key={charIndex} className={`relative ${colorClass}`}>
            {isCursor && (
              <span className="absolute left-0 top-0 w-0.5 h-full bg-primary animate-pulse" />
            )}
            {charData.state === "extra" ? charData.typed : charData.char}
          </span>
        );
      })}
      {/* Cursor at end of word */}
      {isCurrentWord && currentCharIndex >= wordData.chars.length && showCursor && (
        <span className="absolute right-0 top-0 w-0.5 h-full bg-primary animate-pulse translate-x-full" />
      )}
    </span>
  );
}
