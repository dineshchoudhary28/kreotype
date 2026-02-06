"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

// Helper to calculate relative luminance
function getLuminance(hex: string) {
  const rgb = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(rgb.slice(0, 2), 16) / 255;
  const g = parseInt(rgb.slice(2, 4), 16) / 255;
  const b = parseInt(rgb.slice(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to calculate contrast ratio
function getContrastRatio(l1: number, l2: number) {
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentTheme = useThemeStore((s) => s.currentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const colors = { ...currentTheme.colors };

    // Ensure text has enough contrast with background (WCAG AA: 4.5:1)
    const bgLuminance = getLuminance(colors.background);
    const textLuminance = getLuminance(colors.text);
    const contrast = getContrastRatio(bgLuminance, textLuminance);

    if (contrast < 4.5) {
      // If contrast is too low, switch text to either white or black based on bg luminance
      colors.text = bgLuminance > 0.5 ? "#000000" : "#ffffff";
    }
    
    // Ensure primary has enough contrast with background for readability
    const primaryLuminance = getLuminance(colors.primary);
    const primaryContrast = getContrastRatio(bgLuminance, primaryLuminance);
    
    if (primaryContrast < 3) { // Lower threshold for UI components
       // Adjust primary if it's too close to background
       if (bgLuminance > 0.5) {
         // Darken primary for light backgrounds
         colors.primary = "#4f46e5"; 
       } else {
         // Lighten primary for dark backgrounds
         colors.primary = "#818cf8";
       }
    }

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
