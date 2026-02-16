"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
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
  numbers: boolean,
  caseMode: "normal" | "upper" | "lower" | "camel"
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

  // Apply case transformation
  if (caseMode === "upper") {
    words = words.map((w) => w.toUpperCase());
  } else if (caseMode === "lower") {
    words = words.map((w) => w.toLowerCase());
  }

  return words;
}

export function TypingTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordsInnerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  // Timeout ref: delays setting isInputFocused=false so UI button clicks don't flash the blur overlay
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for input focus
  const [isInputFocused, setIsInputFocused] = useState(true);

  // 3-line scroll state (Monkeytype-style translateY)
  const [lineOffset, setLineOffset] = useState(0);
  // 0 = not yet measured; real value set by useLayoutEffect after words render
  const [containerHeight, setContainerHeight] = useState(0);

  // Config store
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const caseMode = useConfigStore((s) => s.caseMode);
  const difficulty = useConfigStore((s) => s.difficulty);
  const caretStyle = useConfigStore((s) => s.caretStyle);
  const language = useConfigStore((s) => s.language);

  // Typing test store
  const testId = useTypingTestStore((s) => s.testId);
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
  const setShowUITemporarily = useFocusModeStore((s) => s.setShowUITemporarily);

  // Mount test timer (drives tick() every 1s while active)
  useTestTimer();

  // Initialize words on mount or config change
  const initializeTest = useCallback(() => {
    const newWords = generateWords(mode, value, punctuation, numbers, caseMode);
    setWords(newWords);
    if (mode === "time") {
      setTimeLeft(parseInt(value, 10));
    }
    inputRef.current?.focus();
    setIsInputFocused(true);
  }, [mode, value, punctuation, numbers, caseMode, setWords, setTimeLeft]);

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

  // Monkeytype-style 3-line scroll: measure line height from DOM, then translateY
  useEffect(() => {
    if (!wordsInnerRef.current) return;

    const wordEls = Array.from(
      wordsInnerRef.current.querySelectorAll('[data-word-index]')
    ) as HTMLElement[];

    if (wordEls.length < 2) return;

    // Compute the pixel height of one line by finding the first word on the second row
    const firstTop = wordEls[0].offsetTop;
    const nextLineEl = wordEls.find((el) => el.offsetTop > firstTop);
    if (!nextLineEl) return;

    const lh = nextLineEl.offsetTop - firstTop;
    if (lh > 0) setContainerHeight(lh * 3);

    // Determine which visual line the current word sits on
    const currentWordEl = wordsInnerRef.current.querySelector(
      `[data-word-index="${currentWordIndex}"]`
    ) as HTMLElement | null;

    if (currentWordEl && lh > 0) {
      const lineIndex = Math.round((currentWordEl.offsetTop - firstTop) / lh);
      // Keep the current line visible: start sliding up only after line 0 is complete
      setLineOffset(Math.max(0, lineIndex - 1));
    }
  }, [currentWordIndex]);

  // On every new test (testId changes): reset scroll AND measure line height before the browser paints.
  // useLayoutEffect runs synchronously after DOM mutations → no one-frame flash.
  // Depends on testId (not words) so it does NOT fire on every keystroke — only when a new
  // test is initialized (setWords/resetTest both regenerate testId).
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional pre-paint DOM measurement, not a cascading render
    setLineOffset(0);

    if (!wordsInnerRef.current) return;

    const wordEls = Array.from(
      wordsInnerRef.current.querySelectorAll('[data-word-index]')
    ) as HTMLElement[];

    if (wordEls.length < 2) return;

    const firstTop = wordEls[0].offsetTop;
    const nextLineEl = wordEls.find((el) => el.offsetTop > firstTop);
    if (!nextLineEl) return;

    const lh = nextLineEl.offsetTop - firstTop;
    if (lh > 0) setContainerHeight(lh * 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: testId changes only on new test, not on every keystroke
  }, [testId]);

  // Smooth floating caret: position the caret div at the active character's location.
  // Use offsetTop/offsetLeft (layout-based, immune to CSS transforms) instead of
  // getBoundingClientRect() which captures mid-animation viewport coordinates during
  // the translateY scroll transition and causes the caret to jump on line scroll.
  useEffect(() => {
    if (caretStyle === "off" || !caretRef.current || !wordsInnerRef.current) return;

    const wordEl = wordsInnerRef.current.querySelector(
      `[data-word-index="${currentWordIndex}"]`
    ) as HTMLElement | null;
    if (!wordEl) return;

    // Current translateY applied to wordsInnerRef
    const translateY = lineOffset * (containerHeight / 3);

    let left: number;
    let top: number;
    let height: number;

    const charEls = Array.from(wordEl.querySelectorAll("[data-char]")) as HTMLElement[];

    if (currentCharIndex < charEls.length) {
      // Position at the left edge of the current char
      // charEl.offsetTop is relative to wordEl (its offsetParent); wordEl.offsetTop is relative to wordsContainerRef
      const charEl = charEls[currentCharIndex];
      left = wordEl.offsetLeft + charEl.offsetLeft;
      top = wordEl.offsetTop + charEl.offsetTop - translateY;
      height = charEl.offsetHeight;
    } else if (charEls.length > 0) {
      // Past the last char: position at the right edge of the last char
      const lastEl = charEls[charEls.length - 1];
      left = wordEl.offsetLeft + lastEl.offsetLeft + lastEl.offsetWidth;
      top = wordEl.offsetTop + lastEl.offsetTop - translateY;
      height = lastEl.offsetHeight;
    } else {
      // Empty word — position at word left
      left = wordEl.offsetLeft;
      top = wordEl.offsetTop - translateY;
      height = wordEl.offsetHeight;
    }

    caretRef.current.style.left = `${left}px`;
    caretRef.current.style.top = `${top}px`;
    caretRef.current.style.height = `${height}px`;
  }, [currentWordIndex, currentCharIndex, words, caretStyle, lineOffset, containerHeight]);

  // Global listener to refocus input when blurred (keyboard + touch)
  // Also handles Tab+Enter restart at document level so it works regardless of input focus
  useEffect(() => {
    const refocusInputOnKey = (e: KeyboardEvent) => {
      // Escape clears any pending Tab state
      if (e.key === "Escape") {
        tabPressedRef.current = false;
      }

      // Handle Tab at document level for Tab+Enter restart
      if (e.key === "Tab") {
        e.preventDefault();
        if (isFinished) {
          initializeTest();
          resetTest();
        } else {
          tabPressedRef.current = true;
        }
      }

      // Handle Tab+Enter combo at document level
      if (e.key === "Enter" && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
        initializeTest();
        resetTest();
        return;
      }

      if (!isInputFocused && !isFinished) {
        e.preventDefault(); // Consume this keypress — only removes blur, doesn't start typing
        inputRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // Give a 1.5s window for Tab→release→Enter sequence
        setTimeout(() => { tabPressedRef.current = false; }, 1500);
      }
    };

    // For touch/click: only auto-refocus when the test is actively running.
    // Clicking anywhere in the page (except header/nav) should bring focus back to the input.
    // This handles config bar buttons, restart button, and any other UI elements.
    const refocusInputOnInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("header") || target.closest("[data-mobile-menu]") || target.closest("nav")) {
        return;
      }
      if (!isInputFocused && !isFinished) {
        inputRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    document.addEventListener("keydown", refocusInputOnKey);
    document.addEventListener("keyup", handleGlobalKeyUp);
    document.addEventListener("touchstart", refocusInputOnInteraction);
    document.addEventListener("click", refocusInputOnInteraction);
    return () => {
      document.removeEventListener("keydown", refocusInputOnKey);
      document.removeEventListener("keyup", handleGlobalKeyUp);
      document.removeEventListener("touchstart", refocusInputOnInteraction);
      document.removeEventListener("click", refocusInputOnInteraction);
    };
  }, [isInputFocused, isFinished, isActive, initializeTest, resetTest]);

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
          incrementTab(); // Tracks alt-key usage for cheat detection (legacy naming)
        }
        return;
      }

      // Tab and Tab+Enter are handled by the global document keydown listener
      // so they work regardless of input focus state
      if (e.key === "Tab" || (e.key === "Enter" && tabPressedRef.current)) {
        return;
      }

      // Escape to reset/restart test
      if (e.key === "Escape") {
        e.preventDefault();
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

      // Hide temporarily shown UI when user resumes typing
      setShowUITemporarily(false);

      // Space to move to next word
      if (e.key === " ") {
        e.preventDefault();
        handleSpace(difficulty);
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
        handleInput(e.key, difficulty);
      }
    },
    [isFinished, isPaused, isActive, difficulty, handleInput, handleBackspace, handleSpace, resetTest, incrementTab, recordKeydown, setShowUITemporarily]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    recordKeyup(e.code);
    // Tab keyup is handled by the global document keyup listener with a 1.5s timeout
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

      // Hide temporarily shown UI when user resumes typing (mobile)
      setShowUITemporarily(false);

      if (nativeEvent.inputType === "insertText" && nativeEvent.data) {
        e.preventDefault();
        for (const char of nativeEvent.data) {
          if (char === " ") {
            handleSpace(difficulty);
          } else {
            handleInput(char, difficulty);
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
    [isFinished, isPaused, difficulty, handleInput, handleSpace, handleBackspace, setShowUITemporarily]
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
            handleSpace(difficulty);
          } else {
            handleInput(char, difficulty);
          }
        }
      }

      // Always clear to prevent autocomplete/suggestion buildup
      target.value = "";
    },
    [isFinished, isPaused, difficulty, handleInput, handleSpace]
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
            handleSpace(difficulty);
          } else {
            handleInput(char, difficulty);
          }
        }
      }

      // Clear the input value after composition ends to prevent text buildup
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [isFinished, isPaused, difficulty, handleInput, handleSpace]
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
    // Cancel any pending blur — focus came back before the 150ms expired
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsInputFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    if (isActive) {
      // During test: refocus immediately so typing isn't interrupted
      inputRef.current?.focus();
      return;
    }
    // Before test: delay before showing the blur overlay.
    // If a button click fires within 150ms (blur always fires before click),
    // handleInputFocus will cancel this timeout and no overlay flash occurs.
    blurTimeoutRef.current = setTimeout(() => {
      blurTimeoutRef.current = null;
      setIsInputFocused(false);
    }, 150);
  }, [isActive]);

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
        // text-2xl md:text-3xl is here so that the em unit in the fallback height resolves
        // to the same font-size as the words — not the inherited body 16px.
        className="mt-4 md:mt-8 relative w-full max-w-[1500px] mx-auto overflow-hidden rounded-2xl cursor-text text-2xl md:text-3xl"
        style={{
          // Before first DOM measurement: calc(3 × leading-relaxed × 1em + 2 row-gaps).
          // em now resolves to text-2xl (24px) on mobile → 3×39px + 8px = 125px
          //                   text-3xl (30px) on desktop → 3×49px + 16px = 163px
          height: containerHeight > 0 ? `${containerHeight}px` : "calc(3 * 1.625em + 1rem)",
        }}
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
        {!isInputFocused && !isActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="text-secondary text-base md:text-lg text-center">Tap here or press any key to focus</div>
          </div>
        )}

        {/* Floating smooth caret — positioned absolutely over the words container */}
        {caretStyle !== "off" && isInputFocused && words.length > 0 && (
          <div
            ref={caretRef}
            className="absolute w-0.5 bg-primary z-10 pointer-events-none rounded-full"
            style={{
              transition: `left ${caretStyle === "slow" ? 150 : caretStyle === "medium" ? 75 : 30}ms ease, top ${caretStyle === "slow" ? 150 : caretStyle === "medium" ? 75 : 30}ms ease`,
              willChange: "left, top",
            }}
          />
        )}

        <div
          ref={wordsInnerRef}
          className={clsx(
            "text-2xl md:text-3xl leading-relaxed md:leading-relaxed font-['Inter'] tracking-wide flex flex-wrap gap-x-2 md:gap-x-3 gap-y-1 md:gap-y-2",
            !isInputFocused && !isActive && "blur-sm"
          )}
          style={{
            transform: `translateY(-${lineOffset * (containerHeight / 3)}px)`,
            transition: "transform 0.15s ease",
          }}
        >
          {words.length === 0 ? (
            // Inline skeleton — same container, same position, no layout shift
            <>
              {[
                [56, 40, 72, 48, 64, 36, 80, 44, 68, 52, 40, 60, 56, 44],
                [48, 64, 36, 56, 72, 44, 52, 80, 40, 60, 48, 36, 72, 50],
                [64, 48, 56, 72, 40, 60, 44, 80, 52, 36, 68, 48, 56, 44],
                [52, 68, 40, 60, 76, 44, 56, 48, 80, 36, 64, 52, 40, 68],
              ].flat().map((w, i) => (
                <span
                  key={i}
                  className="inline-block rounded bg-secondary/20 animate-pulse"
                  // 1.625em matches leading-relaxed — each block is exactly one line tall
                  style={{ width: w, height: "1.625em" }}
                />
              ))}
            </>
          ) : (
            words.map((wordData, wordIndex) => (
              <Word
                key={wordIndex}
                wordData={wordData}
                wordIndex={wordIndex}
                isCurrentWord={wordIndex === currentWordIndex}
                currentCharIndex={wordIndex === currentWordIndex ? currentCharIndex : -1}
                showCursor={isInputFocused && caretStyle === "off"}
              />
            ))
          )}
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
        <div
          className="flex gap-4 sm:gap-8 text-secondary text-[10px] md:text-[11px] font-medium transition-opacity duration-200"
          style={{
            opacity: isActive ? 0 : 0.5,
            visibility: isActive ? "hidden" : "visible",
            pointerEvents: isActive ? "none" : "auto",
          }}
        >
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
          <span key={charIndex} data-char className={`relative ${colorClass}`}>
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
