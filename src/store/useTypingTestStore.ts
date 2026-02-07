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
  errorHistory: number[];
  burstHistory: number[];
  keypressTimings: {
    spacing: number[];
    duration: number[];
  };
}

interface TypingTestState {
  // Test state
  testId: string;
  words: WordData[];
  currentWordIndex: number;
  currentCharIndex: number;
  input: string;
  lastWordTimestamp: number | null;

  // Timer state
  isActive: boolean;
  isFinished: boolean;
  isSaved: boolean; 
  isSyncing: boolean; // Add this
  startTime: number | null;
  endTime: number | null;
  timeLeft: number;
  elapsedTime: number;

  // WPM tracking for consistency
  wpmHistory: number[];
  rawWpmHistory: number[];
  errorHistory: number[];
  burstHistory: number[];

  // Keypress tracking
  keypressTimings: {
    spacing: number[];
    duration: number[];
    last: number;
    first: number;
  };
  keyDownData: Record<string, { timestamp: number; index: number }>;

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
  recordKeydown: (code: string) => void;
  recordKeyup: (code: string) => void;
  finishTest: () => void;
  resetTest: () => void;
  tick: () => void;
  setTimeLeft: (time: number) => void;
  setSaved: (isSaved: boolean) => void; 
  setIsSyncing: (isSyncing: boolean) => void; // Add this
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

  // Key consistency from spacing
  let keyConsistency = 100;
  if (state.keypressTimings.spacing.length > 1) {
    const mean = state.keypressTimings.spacing.reduce((a, b) => a + b, 0) / state.keypressTimings.spacing.length;
    const variance = state.keypressTimings.spacing.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / state.keypressTimings.spacing.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
    keyConsistency = Math.max(0, Math.round(100 - cv));
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
    keyConsistency,
    wpmHistory: state.wpmHistory,
    rawWpmHistory: state.rawWpmHistory,
    errorHistory: state.errorHistory,
    burstHistory: state.burstHistory,
    keypressTimings: {
      spacing: state.keypressTimings.spacing,
      duration: state.keypressTimings.duration,
    },
  };
}

export const useTypingTestStore = create<TypingTestState>((set, get) => ({
  testId: crypto.randomUUID(),
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  input: "",
  lastWordTimestamp: null,
  isActive: false,
  isFinished: false,
  isSaved: false, 
  isSyncing: false, // Add this
  startTime: null,
  endTime: null,
  timeLeft: 30,
  elapsedTime: 0,
  wpmHistory: [],
  rawWpmHistory: [],
  errorHistory: [],
  burstHistory: [],
  keypressTimings: {
    spacing: [],
    duration: [],
    last: -1,
    first: -1,
  },
  keyDownData: {},
  afkCount: 0,
  tabCount: 0,
  blurCount: 0,
  isPaused: false,
  stats: null,

  setSaved: (isSaved) => set({ isSaved }), 
  setIsSyncing: (isSyncing) => set({ isSyncing }), // Add this

  setWords: (wordStrings) => {
    const words = wordStrings.map(createWordData);
    set({
      testId: crypto.randomUUID(), // <-- Generate new ID for new test
      words,
      currentWordIndex: 0,
      currentCharIndex: 0,
      input: "",
      lastWordTimestamp: null,
      isActive: false,
      isFinished: false,
      isSaved: false, 
      isSyncing: false, // And reset here
      startTime: null,
      endTime: null,
      wpmHistory: [],
      rawWpmHistory: [],
      errorHistory: [],
      burstHistory: [],
      keypressTimings: {
        spacing: [],
        duration: [],
        last: -1,
        first: -1,
      },
      keyDownData: {},
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

  recordKeydown: (code) => {
    const now = Date.now();
    set((state) => {
      if (state.isFinished || state.isPaused) return state;

      const newKeyDownData = { ...state.keyDownData };
      if (newKeyDownData[code]) return state; // Key already down

      const spacingArray = [...state.keypressTimings.spacing];
      const durationArray = [...state.keypressTimings.duration];
      
      const index = durationArray.length;
      durationArray.push(0);
      newKeyDownData[code] = { timestamp: now, index };

      let first = state.keypressTimings.first;
      let last = state.keypressTimings.last;

      if (last !== -1) {
        spacingArray.push(now - last);
      }
      last = now;
      if (first === -1) {
        first = now;
      }

      return {
        ...state,
        keyDownData: newKeyDownData,
        keypressTimings: {
          ...state.keypressTimings,
          spacing: spacingArray,
          duration: durationArray,
          first,
          last,
        },
      };
    });
  },

  recordKeyup: (code) => {
    const now = Date.now();
    set((state) => {
      if (state.isFinished) return state;

      const keyDownDataForKey = state.keyDownData[code];
      if (!keyDownDataForKey) return state;

      const durationArray = [...state.keypressTimings.duration];
      durationArray[keyDownDataForKey.index] = now - keyDownDataForKey.timestamp;

      const newKeyDownData = { ...state.keyDownData };
      delete newKeyDownData[code];

      return {
        ...state,
        keyDownData: newKeyDownData,
        keypressTimings: {
          ...state.keypressTimings,
          duration: durationArray,
        },
      };
    });
  },

  handleInput: (char) => {
    set((state) => {
      if (state.isFinished) return state;

      const now = Date.now();
      let startTime = state.startTime;
      let isActive = state.isActive;

      // Start test on first input
      if (!isActive) {
        isActive = true;
        startTime = now;
      }

      const words = [...state.words];
      const currentWord = { ...words[state.currentWordIndex] };
      if (!currentWord) return state;

      const charIndex = state.currentCharIndex;
      const newChars = [...currentWord.chars];

      let isError = false;
      if (charIndex < currentWord.word.length) {
        const expectedChar = newChars[charIndex].char;
        isError = char !== expectedChar;
        newChars[charIndex] = {
          ...newChars[charIndex],
          state: isError ? "incorrect" : "correct",
          typed: char,
        };
      } else {
        isError = true;
        newChars.push({ char: "", state: "extra", typed: char });
      }

      currentWord.chars = newChars;
      words[state.currentWordIndex] = currentWord;
      
      const updatedState = {
        ...state,
        words,
        isActive,
        startTime,
        currentCharIndex: charIndex + 1,
        input: state.input + char,
        elapsedTime: now - (startTime || now),
      };

      const stats = calculateStats(updatedState);
      
      return { ...updatedState, stats };
    });
  },

  handleBackspace: () => {
    set((state) => {
      if (state.isFinished || state.input.length === 0) return state;

      const words = [...state.words];
      const currentWord = { ...words[state.currentWordIndex] };
      if (!currentWord) return state;

      const charIndex = state.currentCharIndex - 1;
      const newChars = [...currentWord.chars];

      if (charIndex >= 0) {
        if (charIndex >= currentWord.word.length) {
          newChars.pop();
        } else {
          newChars[charIndex] = {
            ...newChars[charIndex],
            state: "pending",
            typed: null,
          };
        }

        currentWord.chars = newChars;
        words[state.currentWordIndex] = currentWord;

        const now = Date.now();
        const updatedState = {
          ...state,
          words,
          currentCharIndex: charIndex,
          input: state.input.slice(0, -1),
          elapsedTime: now - (state.startTime || now),
        };

        const stats = calculateStats(updatedState);

        return { ...updatedState, stats };
      }

      return state;
    });
  },

  handleSpace: () => {
    set((state) => {
      if (state.isFinished || state.currentCharIndex === 0) return state;

      const now = Date.now();
      const currentWord = state.words[state.currentWordIndex];
      const isWordCorrect =
        currentWord.chars.every((c) => c.state === "correct") &&
        !currentWord.chars.some((c) => c.state === "extra");

      const words = [...state.words];
      words[state.currentWordIndex] = { ...currentWord, isCorrect: isWordCorrect };

      const nextWordIndex = state.currentWordIndex + 1;
      if (nextWordIndex >= words.length) {
        // Let finishTest handle final stats
        return { ...state, words, lastWordTimestamp: now };
      }

      const updatedState = {
        ...state,
        words,
        currentWordIndex: nextWordIndex,
        currentCharIndex: 0,
        input: "",
        lastWordTimestamp: now,
        elapsedTime: now - (state.startTime || now),
      };

      const stats = calculateStats(updatedState);

      return { ...updatedState, stats };
    });

    const state = get();
    if (state.currentWordIndex + 1 >= state.words.length) {
      get().finishTest();
    }
  },

  finishTest: () => {
    const state = get();
    const endTime = Date.now();
    const elapsedTime = endTime - (state.startTime || endTime);

    // Calculate final stats
    const finalStats = calculateStats({ ...state, isFinished: true, endTime, elapsedTime });
    
    set({
      isActive: false,
      isFinished: true,
      endTime,
      elapsedTime,
      stats: finalStats,
    });
  },

  resetTest: () => {
    set({
      testId: crypto.randomUUID(), // <-- Generate new ID for new test
      currentWordIndex: 0,
      currentCharIndex: 0,
      input: "",
      lastWordTimestamp: null,
      isActive: false,
      isFinished: false,
      isSaved: false, 
      isSyncing: false, // And here
      startTime: null,
      endTime: null,
      elapsedTime: 0,
      wpmHistory: [],
      rawWpmHistory: [],
      errorHistory: [],
      burstHistory: [],
      keypressTimings: {
        spacing: [],
        duration: [],
        last: -1,
        first: -1,
      },
      keyDownData: {},
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

    // Track errors in the last second
    let errorsInLastSecond = 0;
    const currentWord = state.words[state.currentWordIndex];
    if (currentWord) {
        errorsInLastSecond = currentWord.chars.filter(c => c.state === "incorrect" || c.state === "extra").length;
        // This is a simple approximation, Monkeytype tracks error history more precisely
    }

    // Only calculate stats for history, don't set the main stats object
    const currentStats = calculateStats({ ...state, elapsedTime: elapsed });

    set({
      elapsedTime: elapsed,
      timeLeft: Math.max(0, state.timeLeft - 1),
      wpmHistory: [...state.wpmHistory, currentStats.wpm],
      rawWpmHistory: [...state.rawWpmHistory, currentStats.rawWpm],
      errorHistory: [...state.errorHistory, errorsInLastSecond],
      burstHistory: [...state.burstHistory, currentStats.rawWpm],
    });

    // Check if time is up (time mode)
    if (get().timeLeft <= 1) {
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
