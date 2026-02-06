"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { ReactNode } from "react";

const modes = ["time", "words", "quote", "zen", "custom"] as const;

const modeIcons: Record<string, ReactNode> = {
  time: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  words: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  quote: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 2.5-1 4.5-2 5-.5.5-1 1-1 2z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25-1 4.5-1.75 5-.5.5-1 1-1 2z" />
    </svg>
  ),
  zen: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  custom: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

const patternItems = [
  {
    id: "standard",
    name: "standard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    id: "wave",
    name: "wave",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      </svg>
    ),
  },
  {
    id: "mountains",
    name: "mountains",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    ),
  },
];

const values: Record<string, string[]> = {
  time: ["15", "30", "60", "120"],
  words: ["10", "25", "50", "100"],
  quote: ["all", "short", "medium", "long", "thicc"],
};

export function TestConfig() {
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const pattern = useConfigStore((s) => s.pattern);
  const lineMode = useConfigStore((s) => s.lineMode);
  const setConfig = useConfigStore((s) => s.setConfig);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  const handleModeChange = (m: string) => {
    const newValue = values[m] ? values[m][1] || values[m][0] : value;
    updateConfig({ mode: m as typeof mode, value: newValue });
  };

  const currentValues = values[mode];

  return (
    <div className="flex flex-col items-center w-full mt-4 px-4 md:px-0">
      <div className="bg-surface rounded-xl flex flex-col shadow-2xl border border-surface/50 overflow-hidden w-full max-w-[1000px] md:w-fit">
        {/* Top Row: Basic Config */}
        <div className="px-4 md:px-6 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-4 md:gap-8 text-[12px] md:text-[13px] font-medium text-secondary border-b border-surface/50">
          {/* Toggles */}
          <div className="flex items-center gap-4 md:gap-6 border-b md:border-b-0 md:border-r border-surface/50 pb-2 md:pb-0 md:pr-8 w-full md:w-auto justify-center md:justify-start">
            <button
              onClick={() => setConfig("punctuation", !punctuation)}
              className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer ${punctuation ? "text-primary" : ""}`}
            >
              <span className="text-[13px] md:text-[14px]">@</span>
              <span>punctuation</span>
            </button>
            <button
              onClick={() => setConfig("numbers", !numbers)}
              className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer ${numbers ? "text-primary" : ""}`}
            >
              <span className="text-[13px] md:text-[14px]">#</span>
              <span>numbers</span>
            </button>
          </div>

          {/* Modes */}
          <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6 md:border-r border-surface/50 md:pr-8">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer capitalize ${
                  mode === m ? "text-primary" : "text-secondary"
                }`}
              >
                {modeIcons[m]}
                <span className={`${mode === m ? "text-primary" : "text-secondary"} ${m === "custom" ? "hidden sm:inline" : ""}`}>{m}</span>
              </button>
            ))}
          </div>

          {/* Values */}
          <div className="flex items-center justify-center gap-4 md:gap-5 min-w-0 md:min-w-[140px]">
            {currentValues ? (
              currentValues.map((v) => (
                <button
                  key={v}
                  onClick={() => setConfig("value", v)}
                  className={`hover:text-text transition-colors cursor-pointer ${
                    value === v ? "text-primary" : "text-secondary"
                  }`}
                >
                  {v}
                </button>
              ))
            ) : (
              <span className="italic opacity-30 text-[11px]">no options</span>
            )}
          </div>
        </div>

        {/* Bottom Row: Visual Config */}
        <div className="px-4 md:px-6 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-4 md:gap-8 text-[12px] md:text-[13px] font-medium text-secondary">
          {/* Patterns */}
          <div className="flex items-center gap-4 md:gap-6 md:border-r border-surface/50 md:pr-8">
            {patternItems.map((p) => (
              <button
                key={p.id}
                onClick={() => setConfig("pattern", p.id as typeof pattern)}
                className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer capitalize ${
                  pattern === p.id ? "text-primary" : "text-secondary"
                }`}
              >
                {p.icon}
                <span className={`${pattern === p.id ? "text-primary" : "text-secondary"} ${p.id !== "standard" ? "hidden sm:inline" : ""}`}>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Line Modes */}
          <div className="flex items-center gap-4 md:gap-6 md:border-r border-surface/50 md:pr-8">
            <button
              onClick={() => setConfig("lineMode", "single")}
              className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer ${
                lineMode === "single" ? "text-primary" : "text-secondary"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className={`${lineMode === "single" ? "text-primary" : "text-secondary"} hidden sm:inline`}>single line</span>
              <span className={`${lineMode === "single" ? "text-primary" : "text-secondary"} sm:hidden`}>1-line</span>
            </button>
            <button
              onClick={() => setConfig("lineMode", "multi")}
              className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer ${
                lineMode === "multi" ? "text-primary" : "text-secondary"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="7" x2="19" y2="7" />
                <line x1="5" y1="12" x2="19" y2="12" />
                <line x1="5" y1="17" x2="19" y2="17" />
              </svg>
              <span className={`${lineMode === "multi" ? "text-primary" : "text-secondary"} hidden sm:inline`}>multi-line</span>
              <span className={`${lineMode === "multi" ? "text-primary" : "text-secondary"} sm:hidden`}>m-line</span>
            </button>
          </div>

          {/* Hidden Spacer */}
          <div className="hidden md:flex items-center gap-5 min-w-[140px] opacity-0 pointer-events-none">
            <button className="px-4">spacer</button>
          </div>
        </div>
      </div>
    </div>
  );
}