import { create } from "zustand";
import type { TestResult } from "@/types/test";

interface ResultState {
  result: TestResult | null;
  setResult: (result: TestResult) => void;
  clearResult: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));
