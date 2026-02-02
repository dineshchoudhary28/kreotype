"use client";

import { useConfigStore } from "@/store/useConfigStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";
import { useTypingStore } from "@/store/useTypingStore";

export function TimerProgress() {
  const timerStyle = useConfigStore((s) => s.timerStyle);
  const mode = useConfigStore((s) => s.mode);
  const maxTime = useConfigStore((s) => s.time);
  const elapsed = useInputHistoryStore((s) => s.wpmHistory.length);
  const isActive = useTypingStore((s) => s.isActive);

  if (timerStyle === "off" || !isActive) return null;

  const remaining = mode === "time" ? Math.max(0, maxTime - elapsed) : elapsed;

  if (timerStyle === "mini" || timerStyle === "text") {
    return (
      <div className="text-2xl text-primary tabular-nums">
        {remaining}
      </div>
    );
  }

  if (timerStyle === "bar" && mode === "time") {
    const progress = ((maxTime - elapsed) / maxTime) * 100;
    return (
      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden opacity-50">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    );
  }

  return null;
}
