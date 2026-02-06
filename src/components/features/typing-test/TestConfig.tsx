"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { ReactNode } from "react";

const modes = ["time", "words", "zen"] as const;

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
  zen: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

const values: Record<string, string[]> = {
  time: ["15", "30", "60", "120"],
  words: ["10", "25", "50", "100"],
};

export function TestConfig() {
  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const setConfig = useConfigStore((s) => s.setConfig);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  const handleModeChange = (m: string) => {
    const newValue = values[m] ? values[m][1] || values[m][0] : value;
    updateConfig({ mode: m as any, value: newValue });
  };

  const currentValues = values[mode];

  return (
    <div className="flex flex-col items-center w-full mt-4 px-4 md:px-0">
      <div className="bg-surface rounded-xl flex flex-col shadow-2xl border border-surface overflow-hidden w-full max-w-[1000px] md:w-fit">
        {/* Basic Config */}
        <div className="px-4 md:px-6 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-4 md:gap-8 text-[12px] md:text-[13px] font-medium text-secondary">
          {/* Toggles */}
          <div className="flex items-center gap-4 md:gap-6 border-b md:border-b-0 md:border-r border-surface pb-2 md:pb-0 md:pr-8 w-full md:w-auto justify-center md:justify-start">
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
          <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6 md:border-r border-surface md:pr-8">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex items-center gap-1.5 md:gap-2 hover:text-text transition-colors cursor-pointer capitalize ${
                  mode === m ? "text-primary" : "text-secondary"
                }`}
              >
                {modeIcons[m]}
                <span className={`${mode === m ? "text-primary" : "text-secondary"}`}>{m}</span>
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
      </div>
    </div>
  );
}