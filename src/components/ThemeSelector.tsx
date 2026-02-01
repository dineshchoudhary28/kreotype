"use client";

import { useState, useRef, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";
import { Palette } from "lucide-react";

export const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-text transition-colors flex items-center justify-center text-secondary w-8 h-8 rounded hover:bg-surface"
        title="Change Theme"
      >
        <Palette size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-secondary rounded shadow-lg overflow-hidden max-h-64 overflow-y-auto z-50">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                setTheme(theme.name);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-mono hover:bg-background hover:text-primary transition-colors flex items-center justify-between group"
              style={{
                color: currentTheme.name === theme.name ? 'var(--primary)' : 'var(--text)'
              }}
            >
              <span>{theme.label}</span>
              {/* Preview dots */}
              <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.background }}></div>
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};