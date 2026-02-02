import { create } from "zustand";
import type { TestResult } from "@/types/test";

export type SaveStatus = "idle" | "saving" | "saved" | "failed" | "unauthenticated";

const PENDING_RESULT_KEY = "kreotype_pending_result";
const PENDING_CONFIG_KEY = "kreotype_pending_config";

interface ResultState {
  result: TestResult | null;
  error: string | null;
  saveStatus: SaveStatus;
  setResult: (result: TestResult) => void;
  setError: (error: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  clearResult: () => void;
  savePendingResult: (result: TestResult, config: Record<string, unknown>) => void;
  getPendingResult: () => { result: TestResult; config: Record<string, unknown> } | null;
  clearPendingResult: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  result: null,
  error: null,
  saveStatus: "idle",
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  clearResult: () => set({ result: null, error: null, saveStatus: "idle" }),
  savePendingResult: (result, config) => {
    try {
      localStorage.setItem(PENDING_RESULT_KEY, JSON.stringify(result));
      localStorage.setItem(PENDING_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // localStorage may be full or unavailable
    }
  },
  getPendingResult: () => {
    try {
      const resultStr = localStorage.getItem(PENDING_RESULT_KEY);
      const configStr = localStorage.getItem(PENDING_CONFIG_KEY);
      if (!resultStr || !configStr) return null;
      return { result: JSON.parse(resultStr), config: JSON.parse(configStr) };
    } catch {
      return null;
    }
  },
  clearPendingResult: () => {
    try {
      localStorage.removeItem(PENDING_RESULT_KEY);
      localStorage.removeItem(PENDING_CONFIG_KEY);
    } catch {
      // ignore
    }
  },
}));
