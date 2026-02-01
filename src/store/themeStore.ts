import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, themes, defaultTheme } from '@/data/themes';

interface ThemeState {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: defaultTheme,
      setTheme: (themeName: string) => {
        const theme = themes.find((t) => t.name === themeName) || defaultTheme;
        set({ currentTheme: theme });
      },
    }),
    {
      name: 'kreotype-theme-storage',
    }
  )
);
