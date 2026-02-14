"use client";

import { calculateLevel } from "@/lib/leveling";

interface XpProgressBarProps {
  xp: number;
}

export function XpProgressBar({ xp }: XpProgressBarProps) {
  const { level, xpInLevel, xpForNextLevel, progress } = calculateLevel(xp);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="font-bold text-primary">Level {level}</span>
        <span className="text-secondary">{xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
      </div>
      <div className="w-full bg-surface-hover rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
