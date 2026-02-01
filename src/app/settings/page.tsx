"use client";

import { useConfigStore } from "@/store/useConfigStore";
import type { Config } from "@/types/config";

const SETTING_GROUPS = [
  {
    id: "behavior",
    title: "behavior",
    settings: [
      { key: "difficulty", label: "difficulty", type: "select", options: ["normal", "expert", "master"] },
      { key: "language", label: "language", type: "select", options: ["english"] },
    ],
  },
  {
    id: "input",
    title: "input",
    settings: [
      { key: "stopOnError", label: "stop on error", type: "select", options: ["off", "letter", "word"] },
    ],
  },
  {
    id: "caret",
    title: "caret",
    settings: [
      { key: "caretStyle", label: "caret style", type: "select", options: ["line", "block", "underline", "off"] },
    ],
  },
  {
    id: "appearance",
    title: "appearance",
    settings: [
      { key: "timerStyle", label: "timer/progress style", type: "select", options: ["mini", "bar", "text", "off"] },
      { key: "liveSpeedStyle", label: "live speed display", type: "select", options: ["mini", "text", "off"] },
      { key: "liveAccStyle", label: "live accuracy display", type: "select", options: ["mini", "text", "off"] },
      { key: "liveBurstStyle", label: "live burst display", type: "select", options: ["mini", "text", "off"] },
      { key: "highlightMode", label: "highlight mode", type: "select", options: ["letter", "word", "off"] },
      { key: "fontSize", label: "font size", type: "number" },
    ],
  },
] as const;

export default function SettingsPage() {
  const config = useConfigStore();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 px-4 py-8 font-mono">
      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 text-xs">
        {SETTING_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#group_${group.id}`}
            className="text-secondary hover:text-text transition-colors"
          >
            {group.title}
          </a>
        ))}
      </div>

      <p className="text-xs text-secondary">
        tip: You can also change all these settings quickly using the command
        line (
        <kbd className="px-1 py-0.5 rounded bg-secondary bg-opacity-10">ctrl/cmd</kbd>
        +
        <kbd className="px-1 py-0.5 rounded bg-secondary bg-opacity-10">shift</kbd>
        +
        <kbd className="px-1 py-0.5 rounded bg-secondary bg-opacity-10">p</kbd>
        {" "}or{" "}
        <kbd className="px-1 py-0.5 rounded bg-secondary bg-opacity-10">esc</kbd>
        )
      </p>

      {SETTING_GROUPS.map((group) => (
        <section key={group.id} id={`group_${group.id}`} className="flex flex-col gap-4">
          <h2 className="text-base text-primary border-b border-secondary border-opacity-20 pb-2">
            {group.title}
          </h2>
          {group.settings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-text">{setting.label}</label>
              {setting.type === "select" && (
                <div className="flex gap-1">
                  {setting.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => config.setConfig(setting.key as keyof Config, opt as never)}
                      className={`px-3 py-1 rounded text-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
                        config[setting.key as keyof Config] === opt
                          ? "bg-primary text-background"
                          : "text-secondary hover:text-text"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {setting.type === "number" && (
                <input
                  type="number"
                  value={config[setting.key as keyof Config] as number}
                  onChange={(e) =>
                    config.setConfig(setting.key as keyof Config, parseFloat(e.target.value) as never)
                  }
                  step={0.25}
                  min={0.75}
                  max={3}
                  className="w-20 px-2 py-1 bg-background border border-secondary rounded text-text text-xs outline-none focus:border-primary transition-colors"
                />
              )}
            </div>
          ))}
        </section>
      ))}

      {/* Danger Zone */}
      <section id="group_dangerZone" className="flex flex-col gap-4">
        <h2 className="text-base text-[var(--error)] border-b border-[var(--error)] border-opacity-20 pb-2">
          danger zone
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-text">reset settings</div>
            <div className="text-xs text-secondary">Reset all settings to default values.</div>
          </div>
          <button
            onClick={() => config.resetConfig()}
            className="px-4 py-1.5 rounded text-xs bg-[var(--error)] text-background hover:opacity-90 transition-opacity"
          >
            reset
          </button>
        </div>
      </section>
    </div>
  );
}
