"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  if (streak === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-orange-400" title={`Current streak: ${streak} days`}>
      <Flame size={18} />
      <span className="font-bold text-sm">{streak}</span>
    </div>
  );
}
