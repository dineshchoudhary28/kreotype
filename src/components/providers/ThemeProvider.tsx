"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentTheme = useThemeStore((s) => s.currentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    root.style.setProperty("--bg-color", colors.background);
    root.style.setProperty("--surface-color", colors.surface);
    root.style.setProperty("--primary-color", colors.primary);
    root.style.setProperty("--secondary-color", colors.secondary);
    root.style.setProperty("--accent-color", colors.accent);
    root.style.setProperty("--text-color", colors.text);
    root.style.setProperty("--error-color", colors.error);
    root.style.setProperty("--error-extra-color", colors.errorExtra);
    
    // Set background color on body for seamless transitions
    document.body.style.backgroundColor = colors.background;
  }, [currentTheme]);

  return <>{children}</>;
}
