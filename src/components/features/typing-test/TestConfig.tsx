"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { useTypingStore } from "@/store/useTypingStore";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
const MODE_OPTIONS = ["time", "words", "quote", "zen"] as const;

export function TestConfig({ onRestart }: { onRestart: () => void }) {
  const mode = useConfigStore((s) => s.mode);
  const time = useConfigStore((s) => s.time);
  const words = useConfigStore((s) => s.words);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const setConfig = useConfigStore((s) => s.setConfig);
  const isActive = useTypingStore((s) => s.isActive);

  if (isActive) return null;

  const handleModeChange = (m: typeof mode) => {
    setConfig("mode", m);
    onRestart();
  };

  const btnBase = "px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-2";
  const activeClass = "text-primary bg-background/50 shadow-sm";
  const inactiveClass = "text-secondary hover:text-text hover:bg-background/30";

  const showToggles = mode !== "quote" && mode !== "zen";
  const showTimeOptions = mode === "time";
  const showWordOptions = mode === "words";

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 select-none bg-surface/80 backdrop-blur px-8 py-3 rounded-xl shadow-lg border border-white/5 mx-auto max-w-5xl w-fit">
      {/* Toggles - hidden for quote/zen */}
      {showToggles && (
        <div className="flex gap-1">
          <button
            onClick={() => { setConfig("punctuation", !punctuation); onRestart(); }}
            className={`${btnBase} ${punctuation ? activeClass : inactiveClass}`}
          >
            <span className="opacity-50 text-xs font-bold">@</span>punctuation
          </button>
          <button
            onClick={() => { setConfig("numbers", !numbers); onRestart(); }}
            className={`${btnBase} ${numbers ? activeClass : inactiveClass}`}
          >
            <span className="opacity-50 text-xs font-bold">#</span>numbers
          </button>
        </div>
      )}

      {showToggles && <div className="w-px h-8 bg-secondary/20" />}

      {/* Mode */}
      <div className="flex gap-1">
        {MODE_OPTIONS.map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`${btnBase} ${mode === m ? activeClass : inactiveClass}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Separator + options */}
      {(showTimeOptions || showWordOptions) && (
        <>
          <div className="w-px h-8 bg-secondary/20" />
          <div className="flex gap-1">
            {showTimeOptions &&
              TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setConfig("time", t); onRestart(); }}
                  className={`${btnBase} ${time === t ? activeClass : inactiveClass}`}
                >
                  {t}
                </button>
              ))}
            {showWordOptions &&
              WORD_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => { setConfig("words", w); onRestart(); }}
                  className={`${btnBase} ${words === w ? activeClass : inactiveClass}`}
                >
                  {w}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
