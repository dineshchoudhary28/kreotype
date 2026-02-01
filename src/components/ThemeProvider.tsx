"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = currentTheme;

    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--surface", colors.surface);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--text", colors.text);
    root.style.setProperty("--error", colors.error);
    root.style.setProperty("--error-extra", colors.errorExtra);
  }, [currentTheme]);

  return <>{children}</>;
};
