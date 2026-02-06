import { create } from "zustand";

export type CharState = "correct" | "incorrect" | "extra" | "pending";

export interface CharData {
  char: string;
  state: CharState;
  typed: string | null;
}

export interface WordData {
  word: string;
  chars: CharData[];
  isCorrect: boolean | null;
}

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  time: number;
  consistency: number;
  wpmHistory: number[];
  rawWpmHistory: number[];
}

interface TypingTestState {
  // Test state
  words: WordData[];
  currentWordIndex: number;
  currentCharIndex: number;
  input: string;
  lastWordTimestamp: number | null;

  // Timer state
  isActive: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  timeLeft: number;
  elapsedTime: number;

  // WPM tracking for consistency
  wpmHistory: number[];
  rawWpmHistory: number[];

  // Cheating detection
  afkCount: number;
  tabCount: number;
  blurCount: number;
  isPaused: boolean;

  // Stats
  stats: TestStats | null;

  // Actions
  setWords: (words: string[]) => void;
  startTest: () => void;
  handleInput: (char: string) => void;
  handleBackspace: () => void;
  handleSpace: () => void;
  finishTest: () => void;
  resetTest: () => void;
  tick: () => void;
  setTimeLeft: (time: number) => void;
  // Cheating detection
  incrementAfk: () => void;
  incrementTab: () => void;
  incrementBlur: () => void;
  setPaused: (paused: boolean) => void;
}

function createWordData(word: string): WordData {
  return {
    word,
    chars: word.split("").map((char) => ({
      char,
      state: "pending" as CharState,
      typed: null,
    })),
    isCorrect: null,
  };
}

function calculateStats(state: TypingTestState): TestStats {
  const elapsedSeconds = state.elapsedTime / 1000;
  const elapsedMinutes = elapsedSeconds / 60;

  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  let totalTypedChars = 0;

  for (let i = 0; i <= state.currentWordIndex && i < state.words.length; i++) {
    const word = state.words[i];
    for (const char of word.chars) {
      if (char.state === "correct") {
        correctChars++;
        totalTypedChars++;
      } else if (char.state === "incorrect") {
        incorrectChars++;
        totalTypedChars++;
      } else if (char.state === "extra") {
        extraChars++;
        totalTypedChars++;
      } else if (i < state.currentWordIndex && char.state === "pending") {
        missedChars++;
      }
    }
    // Count space between words
    if (i < state.currentWordIndex) {
      correctChars++;
      totalTypedChars++;
    }
  }

  // WPM = (correct chars / 5) / minutes
  const wpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;
  const rawWpm = elapsedMinutes > 0 ? Math.round((totalTypedChars / 5) / elapsedMinutes) : 0;

  // Accuracy = correct / (correct + incorrect + extra)
  const totalAttempts = correctChars + incorrectChars + extraChars;
  const accuracy = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;

  // Consistency calculation from WPM history
  let consistency = 100;
  if (state.wpmHistory.length > 1) {
    const mean = state.wpmHistory.reduce((a, b) => a + b, 0) / state.wpmHistory.length;
    const variance = state.wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / state.wpmHistory.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
    consistency = Math.max(0, Math.round(100 - cv));
  }

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    totalChars: totalTypedChars,
    time: Math.round(elapsedSeconds),
    consistency,
    wpmHistory: state.wpmHistory,
    rawWpmHistory: state.rawWpmHistory,
  };
}

export const useTypingTestStore = create<TypingTestState>((set, get) => ({
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  input: "",
  lastWordTimestamp: null,
  isActive: false,
  isFinished: false,
  startTime: null,
  endTime: null,
  timeLeft: 30,
  elapsedTime: 0,
  wpmHistory: [],
  rawWpmHistory: [],
  afkCount: 0,
  tabCount: 0,
  blurCount: 0,
  isPaused: false,
  stats: null,

  setWords: (wordStrings) => {
    const words = wordStrings.map(createWordData);
    set({
      words,
      currentWordIndex: 0,
      currentCharIndex: 0,
      input: "",
      lastWordTimestamp: null,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      wpmHistory: [],
      rawWpmHistory: [],
      afkCount: 0,
      tabCount: 0,
      blurCount: 0,
      isPaused: false,
      stats: null,
    });
  },

  startTest: () => {
    const state = get();
    if (!state.isActive && !state.isFinished) {
      set({
        isActive: true,
        startTime: Date.now(),
        lastWordTimestamp: Date.now(),
      });
    }
  },

  handleInput: (char) => {
    const state = get();
    if (state.isFinished) return;

    // Start test on first input
    if (!state.isActive) {
      const now = Date.now();
      set({ isActive: true, startTime: now, lastWordTimestamp: now });
    }

    const words = [...state.words];
    const currentWord = { ...words[state.currentWordIndex] };
    if (!currentWord) return;

    const charIndex = state.currentCharIndex;
    const newChars = [...currentWord.chars];

    if (charIndex < currentWord.word.length) {
      // Typing within word bounds
      const expectedChar = newChars[charIndex].char;
      const isCorrect = char === expectedChar;

      newChars[charIndex] = {
        ...newChars[charIndex],
        state: isCorrect ? "correct" : "incorrect",
        typed: char,
      };
    } else {
      // Extra character beyond word length
      newChars.push({
        char: "",
        state: "extra",
        typed: char,
      });
    }

    currentWord.chars = newChars;
    words[state.currentWordIndex] = currentWord;

    set({
      words,
      currentCharIndex: charIndex + 1,
      input: state.input + char,
    });
  },

  handleBackspace: () => {
    const state = get();
    if (state.isFinished || state.input.length === 0) return;

    const words = [...state.words];
    const currentWord = { ...words[state.currentWordIndex] };
    if (!currentWord) return;

    const charIndex = state.currentCharIndex - 1;
    const newChars = [...currentWord.chars];

    if (charIndex >= 0) {
      if (charIndex >= currentWord.word.length) {
        // Remove extra character
        newChars.pop();
      } else {
        // Reset character state
        newChars[charIndex] = {
          ...newChars[charIndex],
          state: "pending",
          typed: null,
        };
      }

      currentWord.chars = newChars;
      words[state.currentWordIndex] = currentWord;

      set({
        words,
        currentCharIndex: charIndex,
        input: state.input.slice(0, -1),
      });
    }
  },

  handleSpace: () => {
    const state = get();
    if (state.isFinished) return;

    const currentWord = state.words[state.currentWordIndex];
    if (!currentWord || state.currentCharIndex === 0) return;

    // Check if word is complete and correct
    const isWordCorrect = currentWord.chars.every(
      (c) => c.state === "correct" || (c.state === "pending" && c.typed === null)
    ) && currentWord.chars.filter(c => c.typed !== null).length === currentWord.word.length
      && !currentWord.chars.some(c => c.state === "extra");

    const words = [...state.words];
    words[state.currentWordIndex] = {
      ...currentWord,
      isCorrect: isWordCorrect,
    };

    const nextWordIndex = state.currentWordIndex + 1;
    const now = Date.now();

    // Check if test is complete (words mode)
    if (nextWordIndex >= words.length) {
      set({ lastWordTimestamp: now });
      get().finishTest();
      return;
    }

    set({
      words,
      currentWordIndex: nextWordIndex,
      currentCharIndex: 0,
      input: "",
      lastWordTimestamp: now,
    });
  },

  finishTest: () => {
    const state = get();
    const endTime = Date.now();
    const elapsedTime = endTime - (state.startTime || endTime);

    set({
      isActive: false,
      isFinished: true,
      endTime,
      elapsedTime,
    });

    // Calculate final stats
    const stats = calculateStats({ ...get() });
    set({ stats });
  },

  resetTest: () => {
    set({
      currentWordIndex: 0,
      currentCharIndex: 0,
      input: "",
      lastWordTimestamp: null,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      elapsedTime: 0,
      wpmHistory: [],
      rawWpmHistory: [],
      afkCount: 0,
      tabCount: 0,
      blurCount: 0,
      isPaused: false,
      stats: null,
    });

    // Reset all word states
    const words = get().words.map((w) => ({
      ...w,
      isCorrect: null,
      chars: w.word.split("").map((char) => ({
        char,
        state: "pending" as CharState,
        typed: null,
      })),
    }));
    set({ words });
  },

  tick: () => {
    const state = get();
    if (!state.isActive || state.isFinished) return;

    const now = Date.now();
    const elapsed = now - (state.startTime || now);

    // Calculate current WPM for history
    const currentStats = calculateStats({ ...state, elapsedTime: elapsed });

    set({
      elapsedTime: elapsed,
      timeLeft: Math.max(0, state.timeLeft - 1),
      wpmHistory: [...state.wpmHistory, currentStats.wpm],
      rawWpmHistory: [...state.rawWpmHistory, currentStats.rawWpm],
    });

    // Check if time is up (time mode)
    if (state.timeLeft <= 1) {
      get().finishTest();
    }
  },

  setTimeLeft: (time) => {
    set({ timeLeft: time });
  },

  incrementAfk: () => {
    set((state) => ({ afkCount: state.afkCount + 1 }));
  },

  incrementTab: () => {
    set((state) => ({ tabCount: state.tabCount + 1 }));
  },

  incrementBlur: () => {
    set((state) => ({ blurCount: state.blurCount + 1 }));
  },

  setPaused: (paused) => {
    set({ isPaused: paused });
  },
}));
