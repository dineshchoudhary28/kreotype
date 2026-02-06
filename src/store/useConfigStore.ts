import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Config, defaultConfig } from "@/types/config";

interface ConfigStore extends Config {
  setConfig: <K extends keyof Config>(key: K, value: Config[K]) => void;
  updateConfig: (partial: Partial<Config>) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...defaultConfig,
      setConfig: (key, value) => set({ [key]: value }),
      updateConfig: (partial) => set((state) => ({ ...state, ...partial })),
      resetConfig: () => set(defaultConfig),
    }),
    { name: "kreotype-config" }
  )
);
