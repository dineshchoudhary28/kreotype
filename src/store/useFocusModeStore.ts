import { create } from "zustand";

interface FocusModeStore {
  /** Whether focus mode is active (hides UI elements) */
  isFocused: boolean;
  /** Enable focus mode - hides header, footer, config, etc. */
  setFocused: (focused: boolean) => void;
  /** Hide cursor during focused typing */
  hideCursor: boolean;
  setHideCursor: (hide: boolean) => void;
}

export const useFocusModeStore = create<FocusModeStore>((set) => ({
  isFocused: false,
  setFocused: (focused) => set({ isFocused: focused }),
  hideCursor: false,
  setHideCursor: (hide) => set({ hideCursor: hide }),
}));
