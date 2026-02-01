"use client";

import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";

interface LiveStatProps {
  type: "wpm" | "accuracy" | "burst";
  style: "mini" | "text" | "off";
}

export function LiveStat({ type, style }: LiveStatProps) {
  const isActive = useTypingStore((s) => s.isActive);
  const blindMode = useConfigStore((s) => s.blindMode);
  const wpmHistory = useInputHistoryStore((s) => s.wpmHistory);
  const accuracy = useInputHistoryStore((s) => s.accuracy);
  const burstHistory = useInputHistoryStore((s) => s.burstHistory);

  if (style === "off" || !isActive || blindMode) return null;

  let value = 0;
  let label = "";

  switch (type) {
    case "wpm":
      value = wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1] : 0;
      label = "wpm";
      break;
    case "accuracy": {
      const total = accuracy.correct + accuracy.incorrect;
      value = total > 0 ? Math.round((accuracy.correct / total) * 100) : 100;
      label = "acc";
      break;
    }
    case "burst":
      value = burstHistory.length > 0 ? burstHistory[burstHistory.length - 1] : 0;
      label = "burst";
      break;
  }

  if (style === "mini") {
    return (
      <div className="text-sm text-secondary font-mono">
        {Math.round(value)}
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-1 font-mono">
      <span className="text-2xl text-primary">{Math.round(value)}</span>
      <span className="text-xs text-secondary">{label}</span>
    </div>
  );
}
