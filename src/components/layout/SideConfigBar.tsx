"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useConfigStore } from "@/store/useConfigStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useTypingTestStore } from "@/store/useTypingTestStore";

export const SIDEBAR_STORAGE_KEY = "kreotype_sidebar_expanded";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold px-2 opacity-40">
        {title}
      </p>
      {children}
    </div>
  );
}

function OptionGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 px-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          onMouseDown={(e) => e.preventDefault()}
          data-typing-safe=""
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            value === opt.value
              ? "bg-primary/10 text-primary"
              : "text-secondary hover:text-text hover:bg-surface"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      data-typing-safe=""
      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-pointer text-sm font-medium ${
        isActive
          ? "text-primary bg-primary/5"
          : "text-secondary hover:text-text hover:bg-surface"
      }`}
    >
      <span className={`text-[13px] font-bold ${isActive ? "text-primary" : ""}`}>{icon}</span>
      <span>{label}</span>
      {/* Toggle switch */}
      <div
        className={`ml-auto flex-shrink-0 w-8 h-4 rounded-full transition-colors duration-200 ${
          isActive ? "bg-primary" : "bg-secondary/20"
        }`}
      >
        <div
          className={`w-3 h-3 rounded-full bg-background shadow-sm transition-transform duration-200 ${
            isActive ? "translate-x-[18px] translate-y-[2px]" : "translate-x-[2px] translate-y-[2px]"
          }`}
        />
      </div>
    </button>
  );
}

export function SideConfigBar() {
  const pathname = usePathname();
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const isFinished = useTypingTestStore((s) => s.isFinished);

  const mode = useConfigStore((s) => s.mode);
  const value = useConfigStore((s) => s.value);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const caseMode = useConfigStore((s) => s.caseMode);
  const difficulty = useConfigStore((s) => s.difficulty);
  const caretStyle = useConfigStore((s) => s.caretStyle);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);
  const sidebarExpanded = useConfigStore((s) => s.sidebarExpanded);
  const setConfig = useConfigStore((s) => s.setConfig);
  const updateConfig = useConfigStore((s) => s.updateConfig);

  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState !== null) {
      setConfig("sidebarExpanded", savedState === "true");
    }
  }, [setConfig]);

  if (pathname !== "/" || isFocused || isFinished) return null;

  const isExpanded = sidebarExpanded;

  const toggleSidebar = () => {
    const newState = !isExpanded;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
    setConfig("sidebarExpanded", newState);
  };

  const handleModeChange = (m: "time" | "words" | "zen") => {
    const modeDefaults: Record<string, string> = { time: "30", words: "25" };
    updateConfig({ mode: m, value: modeDefaults[m] ?? value });
  };

  return (
    <>
      {/* Desktop Sidebar — w-0 when closed, w-64 when open */}
      <aside
        className={`hidden md:flex transition-all duration-300 ease-in-out z-40 flex-col overflow-hidden select-none ${
          isExpanded ? "w-64 bg-surface/50 border-r border-surface" : "w-0"
        }`}
      >
        {/*
          Fixed-width inner container: always 256px wide.
          The aside's overflow-hidden clips it during the open/close animation.
          h-full here resolves to the aside's height, which in turn is determined
          by flex stretch in the flex-row parent (page outer div).
        */}
        <div className="w-64 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-hide">

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={toggleSidebar}
                onMouseDown={(e) => e.preventDefault()}
                data-typing-safe=""
                className="text-secondary hover:text-text bg-surface border border-surface transition-colors p-1.5 rounded-lg hover:border-secondary/30 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* Mode */}
            <Section title="Mode">
              <OptionGroup
                options={[
                  { value: "time", label: "time" },
                  { value: "words", label: "words" },
                  { value: "zen", label: "zen" },
                ]}
                value={mode}
                onChange={(v) => handleModeChange(v as "time" | "words" | "zen")}
              />
            </Section>

            {/* Values — time or words only */}
            {mode !== "zen" && (
              <Section title={mode === "time" ? "Duration (sec)" : "Word Count"}>
                <OptionGroup
                  options={
                    mode === "time"
                      ? [
                          { value: "15", label: "15" },
                          { value: "30", label: "30" },
                          { value: "60", label: "60" },
                          { value: "120", label: "120" },
                        ]
                      : [
                          { value: "10", label: "10" },
                          { value: "25", label: "25" },
                          { value: "50", label: "50" },
                          { value: "100", label: "100" },
                        ]
                  }
                  value={value}
                  onChange={(v) => setConfig("value", v)}
                />
              </Section>
            )}

            {/* Toggles */}
            <Section title="Toggles">
              <ToggleRow
                icon="@"
                label="Punctuation"
                isActive={punctuation}
                onClick={() => setConfig("punctuation", !punctuation)}
              />
              <ToggleRow
                icon="#"
                label="Numbers"
                isActive={numbers}
                onClick={() => setConfig("numbers", !numbers)}
              />
            </Section>

            {/* Difficulty */}
            <Section title="Difficulty">
              <OptionGroup
                options={[
                  { value: "normal", label: "normal" },
                  { value: "expert", label: "expert" },
                  { value: "master", label: "master" },
                ]}
                value={difficulty}
                onChange={(v) => setConfig("difficulty", v as "normal" | "expert" | "master")}
              />
            </Section>

            {/* Caret Style */}
            <Section title="Caret Style">
              <OptionGroup
                options={[
                  { value: "off",       label: "off"     },
                  { value: "line",      label: "line"    },
                  { value: "block",     label: "block"   },
                  { value: "underline", label: "under"   },
                  { value: "outline",   label: "outline" },
                ]}
                value={caretStyle}
                onChange={(v) => setConfig("caretStyle", v as "off" | "line" | "block" | "underline" | "outline")}
              />
            </Section>

            {/* Smooth Caret */}
            <Section title="Smooth Caret">
              <OptionGroup
                options={[
                  { value: "off",    label: "off"    },
                  { value: "slow",   label: "slow"   },
                  { value: "medium", label: "medium" },
                  { value: "fast",   label: "fast"   },
                ]}
                value={smoothCaret}
                onChange={(v) => setConfig("smoothCaret", v as "off" | "slow" | "medium" | "fast")}
              />
            </Section>

            {/* Case */}
            <Section title="Case">
              <OptionGroup
                options={[
                  { value: "lower", label: "lowercase" },
                  { value: "normal", label: "normal" },
                  { value: "upper", label: "UPPER" },
                ]}
                value={caseMode}
                onChange={(v) => setConfig("caseMode", v as "normal" | "upper" | "lower")}
              />
            </Section>

          </div>
        </div>
      </aside>

      {/* Desktop open tab — visible only when sidebar is closed */}
      {!isExpanded && (
        <button
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center h-16 w-5 bg-surface/80 backdrop-blur-sm border border-l-0 border-surface rounded-r-lg text-secondary hover:text-primary hover:w-6 transition-all duration-200 cursor-pointer"
          onClick={toggleSidebar}
          onMouseDown={(e) => e.preventDefault()}
          data-typing-safe=""
          title="Open config panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm">
        <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center justify-around">
          <button
            onClick={() => setConfig("punctuation", !punctuation)}
            onMouseDown={(e) => e.preventDefault()}
            data-typing-safe=""
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              punctuation ? "bg-primary text-background" : "text-secondary"
            }`}
          >
            <span className="text-lg font-bold">@</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Punc</span>
          </button>

          <div className="w-px h-8 bg-white/5" />

          <button
            onClick={() => setConfig("numbers", !numbers)}
            onMouseDown={(e) => e.preventDefault()}
            data-typing-safe=""
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              numbers ? "bg-primary text-background" : "text-secondary"
            }`}
          >
            <span className="text-lg font-bold">#</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Nums</span>
          </button>
        </div>
      </div>
    </>
  );
}
