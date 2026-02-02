import { create } from "zustand";
import type { KeypressTimings } from "@/types/test";

interface InputHistoryState {
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];
  keypressCountHistory: number[];
  afkHistory: boolean[];
  accuracy: { correct: number; incorrect: number };

  // Missed words tracking (word -> count of times missed)
  missedWords: Record<string, number>;

  // Keypress timing tracking
  keypressTimestamps: number[];
  keydownTimestamps: Map<string, number>;
  keypressSpacings: number[];
  keypressDurations: number[];
  overlapCount: number;
  totalKeydowns: number;
  activeKeys: number;
  startToFirstKey: number;
  testStartTime: number | null;
  lastKeypressTime: number;

  currentBurstStart: number | null;
  currentKeypressCount: number;
  currentErrorCount: number;

  pushSecondStats: (wpm: number, raw: number, errors: number, keypresses: number) => void;
  pushBurst: (burst: number) => void;
  incrementCorrect: () => void;
  incrementIncorrect: () => void;
  recordKeydown: (code: string, time: number) => void;
  recordKeyup: (code: string, time: number) => void;
  addKeypressTiming: (time: number) => void;
  setBurstStart: (time: number | null) => void;
  setTestStartTime: (time: number) => void;
  incrementKeypressCount: () => void;
  incrementErrorCount: () => void;
  resetCurrentSecond: () => void;
  trackMissedWord: (word: string) => void;
  pushAfkToHistory: (isAfk: boolean) => void;
  getKeypressTimings: (testEndTime: number) => KeypressTimings;
  reset: () => void;
}

const initialState = {
  wpmHistory: [] as number[],
  rawHistory: [] as number[],
  burstHistory: [] as number[],
  errorHistory: [] as number[],
  keypressCountHistory: [] as number[],
  afkHistory: [] as boolean[],
  accuracy: { correct: 0, incorrect: 0 },
  missedWords: {} as Record<string, number>,
  keypressTimestamps: [] as number[],
  keydownTimestamps: new Map<string, number>(),
  keypressSpacings: [] as number[],
  keypressDurations: [] as number[],
  overlapCount: 0,
  totalKeydowns: 0,
  activeKeys: 0,
  startToFirstKey: 0,
  testStartTime: null as number | null,
  lastKeypressTime: 0,
  currentBurstStart: null as number | null,
  currentKeypressCount: 0,
  currentErrorCount: 0,
};

export const useInputHistoryStore = create<InputHistoryState>((set, get) => ({
  ...initialState,

  pushSecondStats: (wpm, raw, errors, keypresses) => {
    const s = get();
    // Determine AFK: no keypresses this second
    const isAfk = keypresses === 0;
    set({
      wpmHistory: [...s.wpmHistory, wpm],
      rawHistory: [...s.rawHistory, raw],
      errorHistory: [...s.errorHistory, errors],
      keypressCountHistory: [...s.keypressCountHistory, keypresses],
      afkHistory: [...s.afkHistory, isAfk],
      currentKeypressCount: 0,
      currentErrorCount: 0,
    });
  },

  pushBurst: (burst) =>
    set((s) => ({ burstHistory: [...s.burstHistory, burst] })),

  incrementCorrect: () =>
    set((s) => ({ accuracy: { ...s.accuracy, correct: s.accuracy.correct + 1 } })),

  incrementIncorrect: () =>
    set((s) => ({ accuracy: { ...s.accuracy, incorrect: s.accuracy.incorrect + 1 } })),

  recordKeydown: (code, time) => {
    const s = get();
    const newMap = new Map(s.keydownTimestamps);
    newMap.set(code, time);
    const activeKeys = s.activeKeys + 1;
    const overlap = activeKeys > 1 ? s.overlapCount + 1 : s.overlapCount;

    // Compute spacing from last keypress
    const spacings = [...s.keypressSpacings];
    if (s.lastKeypressTime > 0) {
      spacings.push(time - s.lastKeypressTime);
    }

    const startToFirstKey = s.startToFirstKey === 0 && s.testStartTime
      ? time - s.testStartTime
      : s.startToFirstKey;

    set({
      keydownTimestamps: newMap,
      activeKeys,
      overlapCount: overlap,
      totalKeydowns: s.totalKeydowns + 1,
      keypressSpacings: spacings,
      lastKeypressTime: time,
      startToFirstKey,
    });
  },

  recordKeyup: (code, time) => {
    const s = get();
    const downTime = s.keydownTimestamps.get(code);
    const newMap = new Map(s.keydownTimestamps);
    newMap.delete(code);

    const durations = [...s.keypressDurations];
    if (downTime !== undefined) {
      durations.push(time - downTime);
    }

    set({
      keydownTimestamps: newMap,
      activeKeys: Math.max(0, s.activeKeys - 1),
      keypressDurations: durations,
    });
  },

  addKeypressTiming: (time) =>
    set((s) => ({ keypressTimestamps: [...s.keypressTimestamps, time] })),

  setBurstStart: (time) => set({ currentBurstStart: time }),

  setTestStartTime: (time) => set({ testStartTime: time }),

  incrementKeypressCount: () =>
    set((s) => ({ currentKeypressCount: s.currentKeypressCount + 1 })),

  incrementErrorCount: () =>
    set((s) => ({ currentErrorCount: s.currentErrorCount + 1 })),

  resetCurrentSecond: () =>
    set({ currentKeypressCount: 0, currentErrorCount: 0 }),

  trackMissedWord: (word) =>
    set((s) => ({
      missedWords: {
        ...s.missedWords,
        [word]: (s.missedWords[word] ?? 0) + 1,
      },
    })),

  pushAfkToHistory: (isAfk) =>
    set((s) => ({ afkHistory: [...s.afkHistory, isAfk] })),

  getKeypressTimings: (testEndTime: number): KeypressTimings => {
    const s = get();
    const keyOverlap = s.totalKeydowns > 0
      ? (s.overlapCount / s.totalKeydowns) * 100
      : 0;
    const lastKeyToEnd = s.lastKeypressTime > 0
      ? testEndTime - s.lastKeypressTime
      : 0;

    return {
      spacing: s.keypressSpacings,
      duration: s.keypressDurations,
      keyOverlap,
      startToFirstKey: s.startToFirstKey,
      lastKeyToEnd,
    };
  },

  reset: () => set({ ...initialState, keydownTimestamps: new Map(), missedWords: {} }),
}));
