"use client";

import { useSession } from "next-auth/react";
import { useThemeStore } from "@/store/themeStore";
import { useConfigStore } from "@/store/useConfigStore";
import { themes } from "@/data/themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Config } from "@/types/config";

export default function SettingsPage() {
  const { status } = useSession();
  const currentTheme = useThemeStore((s) => s.currentTheme.name);
  const setTheme = useThemeStore((s) => s.setTheme);

  const caseMode = useConfigStore((s) => s.caseMode);
  const difficulty = useConfigStore((s) => s.difficulty);
  const caretStyle = useConfigStore((s) => s.caretStyle);
  const smoothCaret = useConfigStore((s) => s.smoothCaret);
  const setConfig = useConfigStore((s) => s.setConfig);

  const saveConfig = async <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(key, value);
    if (status !== "authenticated") return;
    // getState() reads current store snapshot — avoids stale closure
    const s = useConfigStore.getState();
    await fetch("/api/users/me/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: s.mode, value: s.value, punctuation: s.punctuation, numbers: s.numbers,
        caseMode: s.caseMode, difficulty: s.difficulty, caretStyle: s.caretStyle, smoothCaret: s.smoothCaret,
        language: s.language, sidebarExpanded: s.sidebarExpanded, pageWidth: s.pageWidth,
        [key]: value,
      }),
    });
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-8 py-10 flex flex-col gap-10">
      {/* Page Header */}
      <div className="border-b border-surface pb-8">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Settings
        </h1>
        <p className="text-secondary text-sm font-medium tracking-wide uppercase">
          Customize your Kreotype experience
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* ── Theme ──────────────────────────────────────────────── */}
        <SettingSection
          title="Theme"
          description="Select a color palette for the interface"
          badge={`${themes.length} Available`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {themes.map((theme) => {
              const isActive = currentTheme === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => setTheme(theme.name)}
                  className={cn(
                    "group relative flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                    isActive
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-surface bg-surface hover:border-primary/30 hover:bg-surface/50"
                  )}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className={cn("text-xs font-bold transition-colors", isActive ? "text-text" : "text-secondary group-hover:text-text/80")}>
                      {theme.label}
                    </span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-color),0.8)]" />}
                  </div>
                  <div className="flex gap-2 relative z-10">
                    {(["primary", "secondary", "accent"] as const).map((c) => (
                      <div key={c} className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: theme.colors[c] }} />
                    ))}
                    <div className="w-4 h-4 rounded-full border border-black/20 ml-auto" style={{ backgroundColor: theme.colors.background }} />
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ background: `radial-gradient(circle at bottom right, ${theme.colors.primary}, transparent)` }}
                  />
                </button>
              );
            })}
          </div>
        </SettingSection>

        {/* ── Word Case ──────────────────────────────────────────── */}
        <SettingSection
          title="Word Case"
          description="Choose how words appear during a typing test"
        >
          <div className="flex gap-3 flex-wrap">
            {([
              { value: "lower", label: "lowercase", symbol: "aa", hint: "all words in lowercase" },
              { value: "normal", label: "normal",    symbol: "aA", hint: "words as-is from the word list" },
              { value: "upper", label: "uppercase",  symbol: "AA", hint: "all words in uppercase" },
            ] as const).map(({ value, label, symbol, hint }) => (
              <OptionCard
                key={value}
                active={caseMode === value}
                onClick={() => saveConfig("caseMode", value)}
                symbol={symbol}
                label={label}
                hint={hint}
              />
            ))}
          </div>
        </SettingSection>

        {/* ── Caret Style ─────────────────────────────────────────── */}
        <SettingSection
          title="Caret Style"
          description="Visual appearance of the caret while typing"
        >
          <div className="flex gap-3 flex-wrap">
            {([
              { value: "off",       label: "off",       hint: "no caret, use inline cursor" },
              { value: "line",      label: "line",      hint: "thin vertical bar" },
              { value: "block",     label: "block",     hint: "semi-transparent filled box" },
              { value: "underline", label: "underline", hint: "bar under the character" },
              { value: "outline",   label: "outline",   hint: "bordered box around character" },
            ] as const).map(({ value, label, hint }) => (
              <OptionCard
                key={value}
                active={caretStyle === value}
                onClick={() => saveConfig("caretStyle", value)}
                label={label}
                hint={hint}
              />
            ))}
          </div>
        </SettingSection>

        {/* ── Smooth Caret ───────────────────────────────────────── */}
        <SettingSection
          title="Smooth Caret"
          description="Controls how quickly the caret animates between characters"
        >
          <div className="flex gap-3 flex-wrap">
            {([
              { value: "off",    label: "off",    hint: "instant jump, no animation" },
              { value: "slow",   label: "slow",   hint: "150ms ease transition" },
              { value: "medium", label: "medium", hint: "75ms ease transition" },
              { value: "fast",   label: "fast",   hint: "30ms ease transition" },
            ] as const).map(({ value, label, hint }) => (
              <OptionCard
                key={value}
                active={smoothCaret === value}
                onClick={() => saveConfig("smoothCaret", value)}
                label={label}
                hint={hint}
              />
            ))}
          </div>
        </SettingSection>

        {/* ── Difficulty ─────────────────────────────────────────── */}
        <SettingSection
          title="Difficulty"
          description="Control how strictly incorrect keystrokes are penalised"
        >
          <div className="flex gap-3 flex-wrap">
            {([
              { value: "normal", label: "normal", hint: "no penalty — mistakes are marked but the test continues" },
              { value: "expert", label: "expert", hint: "pressing space on an incorrect word ends the test" },
              { value: "master", label: "master", hint: "any wrong key immediately ends the test" },
            ] as const).map(({ value, label, hint }) => (
              <OptionCard
                key={value}
                active={difficulty === value}
                onClick={() => saveConfig("difficulty", value)}
                label={label}
                hint={hint}
                wide
              />
            ))}
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ────────────────────────────────────── */

function SettingSection({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-text mb-1">{title}</h2>
          <p className="text-xs text-secondary">{description}</p>
        </div>
        {badge && (
          <div className="px-3 py-1 bg-surface rounded-lg border border-surface text-[10px] font-bold text-primary uppercase tracking-widest">
            {badge}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function OptionCard({
  active,
  onClick,
  symbol,
  label,
  hint,
  wide = false,
}: {
  active: boolean;
  onClick: () => void;
  symbol?: string;
  label: string;
  hint: string;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-2 px-5 py-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
        wide ? "min-w-[180px] max-w-xs" : "min-w-[110px]",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-surface bg-surface text-secondary hover:text-text hover:border-text/20"
      )}
    >
      {active && (
        <span className="absolute top-3 right-3 text-primary">
          <Check size={12} />
        </span>
      )}
      {symbol && (
        <span className="text-xl font-mono">{symbol}</span>
      )}
      <span className="uppercase tracking-widest text-[10px]">{label}</span>
      <span className={cn("text-[11px] font-normal leading-snug text-left", active ? "text-primary/70" : "text-secondary/60")}>
        {hint}
      </span>
    </button>
  );
}
