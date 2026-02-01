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

  initTest: (words: string[]) => void;
  setCurrentInput: (val: string) => void;
  submitWord: () => void;
  startTest: () => void;
  finishTest: () => void;
  resetTest: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  words: [],
  wordInputs: [],
  currentInput: "",
  activeWordIndex: 0,
  isActive: false,
  isFinished: false,
  startTime: null,
  endTime: null,

  initTest: (words) =>
    set({
      words,
      wordInputs: [],
      currentInput: "",
      activeWordIndex: 0,
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
    }),

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
    }),
}));
