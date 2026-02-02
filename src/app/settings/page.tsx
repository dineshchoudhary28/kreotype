"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";
import { settingGroups } from "@/core/settings-metadata";
import { SettingSection } from "@/components/features/settings/SettingSection";
import { SettingsQuickNav } from "@/components/features/settings/SettingsQuickNav";
import { useState } from "react";

export default function SettingsPage() {
  const resetConfig = useConfigStore((s) => s.resetConfig);
  const colorfulMode = useConfigStore((s) => s.colorfulMode);
  const setConfig = useConfigStore((s) => s.setConfig);

  // Groups that are rendered via SettingSection (generic)
  const genericGroups = settingGroups.filter(
    (g) => g.id !== "theme" && g.id !== "dangerZone"
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl text-text mb-2">settings</h1>
      <p className="text-xs text-secondary mb-6">
        Changes are saved automatically.
      </p>

      <SettingsQuickNav />

      {/* Generic sections: behavior, input, sound, caret, appearance, hideElements */}
      {genericGroups.map((group) => (
        <SettingSection key={group.id} group={group} />
      ))}

      {/* Theme section */}
      <ThemeSection colorfulMode={colorfulMode} setColorful={(v) => setConfig("colorfulMode", v)} />

      {/* Danger Zone */}
      <DangerZoneSection onReset={resetConfig} />
    </div>
  );
}

// ── Theme Section ──

function ThemeSection({
  colorfulMode,
  setColorful,
}: {
  colorfulMode: boolean;
  setColorful: (v: boolean) => void;
}) {
  const currentTheme = useThemeStore((s) => s.currentTheme.name);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <section id="settings-theme" className="scroll-mt-20 mt-4">
      <h2 className="text-sm font-medium text-text py-3">theme</h2>
      <p className="text-xs text-secondary mb-4">
        Theme selection and color options
      </p>

      {/* Colorful mode toggle */}
      <div className="flex items-center justify-between py-3 border-b border-secondary/10">
        <div>
          <h4 className="text-sm text-text">colorful mode</h4>
          <p className="text-xs text-secondary mt-0.5">
            Use multiple colors for the test text based on correctness.
          </p>
        </div>
        <button
          onClick={() => setColorful(!colorfulMode)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            colorfulMode ? "bg-primary" : "bg-secondary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
              colorfulMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.name;
          return (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className={`flex flex-col gap-1 p-3 rounded border transition-colors ${
                isActive
                  ? "border-primary"
                  : "border-secondary/10 hover:border-secondary/30"
              }`}
              style={{ backgroundColor: theme.colors.background }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: theme.colors.text }}
              >
                {theme.label}
              </span>
              <div className="flex gap-1">
                {(
                  ["primary", "secondary", "accent", "error"] as const
                ).map((c) => (
                  <span
                    key={c}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors[c] }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Danger Zone ──

function DangerZoneSection({ onReset }: { onReset: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [confirmLocal, setConfirmLocal] = useState(false);
  const [accountResetting, setAccountResetting] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onReset();
    setConfirmReset(false);
  };

  const handleAccountReset = async () => {
    if (!confirmAccount) {
      setConfirmAccount(true);
      return;
    }
    setAccountResetting(true);
    try {
      const res = await fetch("/api/account/reset", { method: "POST" });
      if (res.ok) {
        localStorage.clear();
        window.location.reload();
      }
    } catch {
      // failed silently
    } finally {
      setAccountResetting(false);
      setConfirmAccount(false);
    }
  };

  const handleClearLocal = () => {
    if (!confirmLocal) {
      setConfirmLocal(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <section id="settings-dangerZone" className="scroll-mt-20 mt-8">
      <h2 className="text-sm font-medium text-[var(--error)] py-3">
        danger zone
      </h2>

      <div className="flex flex-col gap-4">
        {/* Reset settings */}
        <div className="flex items-start justify-between gap-4 py-4 border-b border-secondary/10">
          <div>
            <h4 className="text-sm text-text">reset settings to default</h4>
            <p className="text-xs text-secondary mt-0.5">
              Resets all settings back to their default values.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="shrink-0 px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background hover:opacity-90 transition-opacity"
          >
            {confirmReset ? "are you sure?" : "reset settings"}
          </button>
        </div>

        {/* Reset account (server-side) */}
        <div className="flex items-start justify-between gap-4 py-4 border-b border-secondary/10">
          <div>
            <h4 className="text-sm text-text">reset account</h4>
            <p className="text-xs text-secondary mt-0.5">
              Deletes all test results, personal bests, and resets stats to zero. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleAccountReset}
            disabled={accountResetting}
            className="shrink-0 px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {accountResetting ? "resetting..." : confirmAccount ? "are you sure?" : "reset account"}
          </button>
        </div>

        {/* Clear local data */}
        <div className="flex items-start justify-between gap-4 py-4 border-b border-secondary/10">
          <div>
            <h4 className="text-sm text-text">clear local data</h4>
            <p className="text-xs text-secondary mt-0.5">
              Clears locally stored settings and preferences. Does not affect server data.
            </p>
          </div>
          <button
            onClick={handleClearLocal}
            className="shrink-0 px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background hover:opacity-90 transition-opacity"
          >
            {confirmLocal ? "are you sure?" : "clear local data"}
          </button>
        </div>
      </div>
    </section>
  );
}
