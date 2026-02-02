import { create } from "zustand";

interface TypingState {
  words: string[];
  wordInputs: string[];
  currentInput: string;
  activeWordIndex: number;
  isActive: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  testId: number;

  // New fields from Monkeytype test-state.ts
  testRestarting: boolean;
  testRestartingPromise: Promise<void> | null;
  bailedOut: boolean;
  selectedQuoteId: number | null;
  isLanguageRTL: boolean;
  testInitSuccess: boolean;
  isRepeated: boolean;
  isPaceRepeat: boolean;

  // Incomplete test tracking (from test-stats.ts)
  restartCount: number;
  incompleteTestSeconds: number;

  initTest: (words: string[]) => void;
  setCurrentInput: (val: string) => void;
  submitWord: () => void;
  startTest: () => void;
  finishTest: () => void;
  resetTest: () => void;
  setTestRestarting: (val: boolean) => void;
  setBailedOut: (val: boolean) => void;
  setSelectedQuoteId: (id: number | null) => void;
  setLanguageRTL: (rtl: boolean) => void;
  setTestInitSuccess: (val: boolean) => void;
  setRepeated: (val: boolean) => void;
  setPaceRepeat: (val: boolean) => void;
  incrementRestartCount: () => void;
  addIncompleteTestSeconds: (seconds: number) => void;
}

let restartingResolve: (() => void) | null = null;

export const useTypingStore = create<TypingState>((set, get) => ({
  words: [],
  wordInputs: [],
  currentInput: "",
  activeWordIndex: 0,
  isActive: false,
  isFinished: false,
  startTime: null,
  endTime: null,
  testId: 0,

  testRestarting: false,
  testRestartingPromise: null,
  bailedOut: false,
  selectedQuoteId: null,
  isLanguageRTL: false,
  testInitSuccess: true,
  isRepeated: false,
  isPaceRepeat: false,
  restartCount: 0,
  incompleteTestSeconds: 0,

  initTest: (words) =>
    set((state) => ({
      words,
      wordInputs: [],
      currentInput: "",
      activeWordIndex: 0,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      testId: state.testId + 1,
      testInitSuccess: true,
      bailedOut: false,
    })),

  setCurrentInput: (val) => set({ currentInput: val }),

  submitWord: () => {
    const { currentInput, wordInputs, activeWordIndex } = get();
    set({
      wordInputs: [...wordInputs, currentInput],
      currentInput: "",
      activeWordIndex: activeWordIndex + 1,
    });
  },

  startTest: () => set({ isActive: true, startTime: Date.now() }),

  finishTest: () =>
    set({ isActive: false, isFinished: true, endTime: Date.now() }),

  resetTest: () =>
    set({
      words: [],
      wordInputs: [],
      currentInput: "",
      activeWordIndex: 0,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      testId: 0,
      testRestarting: false,
      testRestartingPromise: null,
      bailedOut: false,
      selectedQuoteId: null,
      testInitSuccess: true,
      isRepeated: false,
      isPaceRepeat: false,
      restartCount: 0,
      incompleteTestSeconds: 0,
    }),

  setTestRestarting: (val) => {
    if (val) {
      const promise = new Promise<void>((resolve) => {
        restartingResolve = resolve;
      });
      set({ testRestarting: true, testRestartingPromise: promise });
    } else {
      restartingResolve?.();
      restartingResolve = null;
      set({ testRestarting: false, testRestartingPromise: null });
    }
  },

  setBailedOut: (val) => set({ bailedOut: val }),
  setSelectedQuoteId: (id) => set({ selectedQuoteId: id }),
  setLanguageRTL: (rtl) => set({ isLanguageRTL: rtl }),
  setTestInitSuccess: (val) => set({ testInitSuccess: val }),
  setRepeated: (val) => set({ isRepeated: val }),
  setPaceRepeat: (val) => set({ isPaceRepeat: val }),
  incrementRestartCount: () => set((s) => ({ restartCount: s.restartCount + 1 })),
  addIncompleteTestSeconds: (seconds) =>
    set((s) => ({ incompleteTestSeconds: s.incompleteTestSeconds + seconds })),
}));
