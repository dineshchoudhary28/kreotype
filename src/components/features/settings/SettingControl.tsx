"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import type { SettingMeta } from "@/core/settings-metadata";
import type { Config } from "@/types/config";
import { cn } from "@/lib/utils";

export function SettingControl({ meta }: { meta: SettingMeta }) {
  const value = useConfigStore((s) => s[meta.key]);
  const setConfig = useConfigStore((s) => s.setConfig);
  const [showTooltip, setShowTooltip] = useState(false);

  const setValue = (v: Config[typeof meta.key]) => {
    setConfig(meta.key, v);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-secondary/10 last:border-b-0 hover:bg-surface/30 px-2 rounded transition-colors">
      <div className="flex items-center gap-2 flex-1 min-w-0 pr-4">
        <h4 className="text-sm font-medium text-text">{meta.label}</h4>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="text-secondary/50 hover:text-secondary transition-colors"
            aria-label={`Info about ${meta.label}`}
          >
            <Info size={14} />
          </button>
          {showTooltip && (
            <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 text-xs text-text bg-surface border border-secondary/20 rounded-lg shadow-lg pointer-events-none">
              {meta.description}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-surface border-r border-b border-secondary/20 rotate-45 -mt-1" />
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 pt-1 sm:pt-0">{renderControl(meta, value, setValue)}</div>
    </div>
  );
}

function renderControl(
  meta: SettingMeta,
  value: Config[keyof Config],
  setValue: (v: Config[keyof Config]) => void
) {
  switch (meta.controlType) {
    case "toggle":
      return <ToggleControl checked={value as boolean} onChange={setValue} />;

    case "buttonGroup":
      return (
        <ButtonGroupControl
          options={meta.options!}
          value={value}
          onChange={setValue}
        />
      );

    case "select":
      return (
        <SelectControl
          options={meta.options!}
          value={value as string}
          onChange={setValue}
        />
      );

    case "range":
      return (
        <RangeControl
          value={value as number}
          onChange={setValue}
          min={meta.range!.min}
          max={meta.range!.max}
          step={meta.range!.step}
        />
      );

    case "input":
      return (
        <InputControl value={value as string} onChange={setValue} />
      );

    default:
      return null;
  }
}

function ToggleControl({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
        checked ? "bg-primary" : "bg-surface border border-secondary/30"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function ButtonGroupControl({
  options,
  value,
  onChange,
}: {
  options: { value: string | number | boolean; label: string }[];
  value: Config[keyof Config];
  onChange: (v: Config[keyof Config]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value as Config[keyof Config])}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
            value === opt.value
              ? "bg-primary text-background shadow-sm"
              : "bg-surface text-secondary hover:text-text hover:bg-secondary/20"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SelectControl({
  options,
  value,
  onChange,
}: {
  options: { value: string | number | boolean; label: string }[];
  value: string;
  onChange: (v: Config[keyof Config]) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Config[keyof Config])}
        className="appearance-none bg-surface text-text text-xs font-medium rounded-md pl-3 pr-8 py-2 border border-secondary/20 outline-none focus:border-primary cursor-pointer hover:border-secondary/40 transition-colors"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function RangeControl({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: Config[keyof Config]) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex items-center gap-4 bg-surface/50 px-3 py-1.5 rounded-lg border border-secondary/10">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Config[keyof Config])}
        className="w-32 h-1.5 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="w-8 text-right">
        <span className="text-xs font-mono font-medium text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

function InputControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: Config[keyof Config]) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value as Config[keyof Config])}
      className="bg-surface text-text text-xs font-mono rounded-md px-3 py-2 border border-secondary/20 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 w-48 transition-all"
    />
  );
}
