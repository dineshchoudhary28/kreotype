"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useConfigStore } from "@/store/useConfigStore";
import { useTypingTestStore, WordData } from "@/store/useTypingTestStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useTestTimer } from "@/hooks/useTestTimer";
import { TestResults } from "./TestResults";
import englishWords from "@/data/languages/english.json";
import clsx from "clsx";

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

  if (mode === "zen") {
    // Zen mode: infinite words, we'll generate a batch
    words = shuffleArray(englishWords).slice(0, 100);
  } else {
    // Generate enough words for the mode
    const wordCount = mode === "words" ? parseInt(value, 10) : 200;
    words = [];
    const shuffled = shuffleArray(englishWords);
    for (let i = 0; i < wordCount; i++) {
      words.push(shuffled[i % shuffled.length]);
    }
  }

  // Apply punctuation
  if (punctuation) {
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
  if (numbers) {
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

  // Local state for input focus
  const [isInputFocused, setIsInputFocused] = useState(true);

  // Config store
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const language = useConfigStore((s) => s.language);

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
  const setTimeLeft = useTypingTestStore((s) => s.setTimeLeft);
  const incrementBlur = useTypingTestStore((s) => s.incrementBlur);
  const handleFocus = useTypingTestStore((s) => s.handleFocus);
  const incrementTab = useTypingTestStore((s) => s.incrementTab);
  const setPaused = useTypingTestStore((s) => s.setPaused);
  const recordKeydown = useTypingTestStore((s) => s.recordKeydown);
  const recordKeyup = useTypingTestStore((s) => s.recordKeyup);

  // Focus mode store
  const setFocused = useFocusModeStore((s) => s.setFocused);

  // Mount test timer (drives tick() every 1s while active)
  useTestTimer();

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
        handleFocus();
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
        handleFocus();
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
  }, [isActive, isPaused, incrementBlur, handleFocus, setPaused]);

  // Scroll to current word
  useEffect(() => {
    if (wordsContainerRef.current) {
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
  }, [currentWordIndex]);

  // Global listener to refocus input when blurred (keyboard + touch)
  useEffect(() => {
    const refocusInput = () => {
      if (!isInputFocused && !isFinished) {
        inputRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    document.addEventListener("keydown", refocusInput);
    document.addEventListener("touchstart", refocusInput);
    document.addEventListener("click", refocusInput);
    return () => {
      document.removeEventListener("keydown", refocusInput);
      document.removeEventListener("touchstart", refocusInput);
      document.removeEventListener("click", refocusInput);
    };
  }, [isInputFocused, isFinished]);

  // Track Tab key state for Tab+Enter restart
  const tabPressedRef = useRef(false);

  // Track composition state for mobile virtual keyboards
  const isComposingRef = useRef(false);

  // Handle keyboard events - sync (no async handlers for input)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Skip during mobile composition (virtual keyboard with predictions)
      // Mobile fires keydown with key="Unidentified" or keyCode=229 during composition
      if (isComposingRef.current || e.key === "Process" || e.nativeEvent.isComposing) {
        // Still allow Escape/Tab during composition
        if (e.key !== "Escape" && e.key !== "Tab") return;
      }

      // Record timing
      recordKeydown(e.code);

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

      // Regular character input (skip "Unidentified" from mobile — handled by beforeinput)
      if (e.key.length === 1 && e.key !== "Unidentified" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleInput(e.key);
      }
    },
    [isFinished, isPaused, isActive, handleInput, handleBackspace, handleSpace, initializeTest, resetTest, incrementTab, recordKeydown]
  );

  // Reset tab state on key up
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    recordKeyup(e.code);
    if (e.key === "Tab") {
      tabPressedRef.current = false;
    }
  }, [recordKeyup]);

  // Handle mobile virtual keyboard input via beforeinput events
  // On desktop: keydown calls preventDefault() first, so beforeinput never fires
  // On mobile: keydown gets "Unidentified" key, skips handling, so beforeinput processes input
  const handleBeforeInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const nativeEvent = e.nativeEvent as InputEvent;

      // During composition, let the browser handle input natively.
      // Composed text is processed on compositionEnd instead.
      if (isComposingRef.current || nativeEvent.inputType === "insertCompositionText") {
        return;
      }

      if (isFinished || isPaused) {
        e.preventDefault();
        return;
      }

      if (nativeEvent.inputType === "insertText" && nativeEvent.data) {
        e.preventDefault();
        for (const char of nativeEvent.data) {
          if (char === " ") {
            handleSpace();
          } else {
            handleInput(char);
          }
        }
      } else if (
        nativeEvent.inputType === "deleteContentBackward" ||
        nativeEvent.inputType === "deleteWordBackward"
      ) {
        e.preventDefault();
        handleBackspace();
      } else if (nativeEvent.inputType === "insertLineBreak") {
        e.preventDefault();
      }
    },
    [isFinished, isPaused, handleInput, handleSpace, handleBackspace]
  );

  // Fallback input handler for older mobile browsers that don't support beforeinput.
  // When beforeinput calls preventDefault(), this event won't fire (input was cancelled).
  // This only fires if beforeinput didn't handle the input.
  const handleInputChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      // During composition, don't process or clear — it breaks the composition session.
      // The composed text will be handled by compositionEnd.
      if (isComposingRef.current) return;

      const target = e.target as HTMLInputElement;
      const value = target.value;

      if (!isFinished && !isPaused && value) {
        for (const char of value) {
          if (char === " ") {
            handleSpace();
          } else {
            handleInput(char);
          }
        }
      }

      // Always clear to prevent autocomplete/suggestion buildup
      target.value = "";
    },
    [isFinished, isPaused, handleInput, handleSpace]
  );

  // Composition event handlers for mobile virtual keyboards with predictive text.
  // Mobile keyboards use the Composition API for word prediction/autocorrect.
  // Without these, composition text never reaches the typing engine.
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const data = e.data;

      if (data && !isFinished && !isPaused) {
        for (const char of data) {
          if (char === " ") {
            handleSpace();
          } else {
            handleInput(char);
          }
        }
      }

      // Clear the input value after composition ends to prevent text buildup
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [isFinished, isPaused, handleInput, handleSpace]
  );

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
    initializeTest();
    resetTest();
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [initializeTest, resetTest]);

  const handleNext = useCallback(() => {
    initializeTest();
    resetTest();
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [initializeTest, resetTest]);

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
        <div
          className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 rounded-2xl cursor-pointer"
          onClick={() => {
            inputRef.current?.focus();
            setIsInputFocused(true);
          }}
        >
          <div className="text-center px-6">
            <div className="text-xl md:text-2xl font-bold text-primary mb-4">Test Paused</div>
            <div className="text-secondary text-sm md:text-base">Tap here or press any key to continue</div>
          </div>
        </div>
      )}

      {/* Typing Text Display */}
      <div
        ref={wordsContainerRef}
        className="mt-4 md:mt-8 relative w-full max-w-[1500px] mx-auto overflow-hidden rounded-2xl cursor-text"
        style={{ maxHeight: "200px" }}
      >
        {/* Full-size transparent input overlay — real dimensions so mobile keyboards activate */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          className="absolute inset-0 w-full h-full z-20 border-none outline-none"
          style={{
            fontSize: "16px",
            color: "transparent",
            caretColor: "transparent",
            background: "transparent",
            WebkitAppearance: "none",
            touchAction: "manipulation",
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBeforeInput={handleBeforeInput}
          onInput={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onPaste={handlePaste}
          onCopy={handleCopy}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="Type here"
        />

        {/* Focus prompt overlay — pointer-events-none so taps pass through to input */}
        {!isInputFocused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="text-secondary text-base md:text-lg text-center">Tap here or press any key to focus</div>
          </div>
        )}

        <div
          className={clsx(
            "text-2xl md:text-3xl leading-relaxed font-['Inter'] tracking-wide flex flex-wrap gap-x-2 md:gap-x-3 gap-y-1 md:gap-y-2 transition-all duration-300",
            !isInputFocused && "blur-sm"
          )}
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
