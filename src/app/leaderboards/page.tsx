"use client";

import { useState } from "react";

type LeaderboardType = "allTime" | "weekly" | "daily";
type TimeMode = "15" | "60";

export default function LeaderboardsPage() {
  const [type, setType] = useState<LeaderboardType>("allTime");
  const [timeMode, setTimeMode] = useState<TimeMode>("15");

  return (
    <div className="w-full max-w-5xl mx-auto flex gap-6 px-4 py-8 font-mono">
      {/* Main table area */}
      <div className="flex-1">
        <h2 className="text-lg text-primary mb-1">
          {type === "allTime" && "All-Time English Leaderboard"}
          {type === "weekly" && "Weekly XP Leaderboard"}
          {type === "daily" && "Daily Leaderboard"}
        </h2>
        <div className="text-xs text-secondary mb-4">
          {type === "allTime" && `time ${timeMode}`}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-secondary">Updates in: -</div>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors">
              ⟨
            </button>
            <button className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors">
              #
            </button>
            <button className="px-2 py-1 rounded text-xs text-secondary hover:text-text transition-colors">
              ⟩
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-secondary text-xs border-b border-secondary border-opacity-20">
              <td className="py-2 pr-3">#</td>
              <td className="py-2">name</td>
              {type !== "weekly" ? (
                <>
                  <td className="py-2 text-right">wpm</td>
                  <td className="py-2 text-right">accuracy</td>
                  <td className="py-2 text-right">raw</td>
                  <td className="py-2 text-right">consistency</td>
                </>
              ) : (
                <>
                  <td className="py-2 text-right">xp gained</td>
                  <td className="py-2 text-right">time typed</td>
                </>
              )}
              <td className="py-2 text-right">date</td>
            </tr>
          </thead>
          <tbody>
            <tr className="text-secondary text-center">
              <td colSpan={type !== "weekly" ? 7 : 5} className="py-8">
                No data available. Sign in to see leaderboards.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Side buttons */}
      <div className="flex flex-col gap-3 w-48 shrink-0">
        <div className="flex flex-col gap-1">
          {(["allTime", "weekly", "daily"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded text-xs text-left transition-all duration-150 hover:scale-105 active:scale-95 ${
                type === t
                  ? "bg-primary text-background"
                  : "text-secondary hover:text-text"
              }`}
            >
              {t === "allTime" && "all-time english"}
              {t === "weekly" && "weekly xp"}
              {t === "daily" && "daily"}
            </button>
          ))}
        </div>

        {type === "allTime" && (
          <>
            <div className="w-full h-px bg-secondary opacity-20" />
            <div className="flex flex-col gap-1">
              {(["15", "60"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTimeMode(m)}
                  className={`px-3 py-2 rounded text-xs text-left transition-all duration-150 hover:scale-105 active:scale-95 ${
                    timeMode === m
                      ? "bg-primary text-background"
                      : "text-secondary hover:text-text"
                  }`}
                >
                  time {m}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
