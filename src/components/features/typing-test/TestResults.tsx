"use client";

import { TestStats } from "@/store/useTypingTestStore";

interface TestResultsProps {
  stats: TestStats;
  onRestart: () => void;
  onNext: () => void;
}

export function TestResults({ stats, onRestart, onNext }: TestResultsProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center animate-in fade-in duration-300">
      {/* Main Stats */}
      <div className="flex gap-16 items-end">
        {/* WPM */}
        <div className="flex flex-col items-center">
          <span className="text-secondary text-sm font-medium mb-2">wpm</span>
          <span className="text-primary text-7xl font-bold tabular-nums">
            {stats.wpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col items-center">
          <span className="text-secondary text-sm font-medium mb-2">acc</span>
          <span className="text-primary text-7xl font-bold tabular-nums">
            {stats.accuracy}%
          </span>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="mt-12 grid grid-cols-4 gap-8">
        <StatBlock label="test type" value="time" subValue={`${stats.time}s`} />
        <StatBlock label="raw" value={stats.rawWpm.toString()} />
        <StatBlock label="characters" value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`} />
        <StatBlock label="consistency" value={`${stats.consistency}%`} />
      </div>

      {/* Time */}
      <div className="mt-8">
        <StatBlock label="time" value={formatTime(stats.time)} />
      </div>

      {/* Actions */}
      <div className="mt-12 flex gap-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-text transition-colors cursor-pointer group"
          title="Next Test (Tab)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          <span className="text-sm">next test</span>
        </button>

        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-text transition-colors cursor-pointer group"
          title="Restart Test"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:rotate-180 transition-transform duration-500"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          <span className="text-sm">restart</span>
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-8 flex gap-6 text-secondary text-[11px] font-medium opacity-50">
        <div className="flex items-center gap-2">
          <kbd className="bg-surface px-1.5 py-0.5 rounded border border-gray-900 text-secondary font-sans">
            tab
          </kbd>
          <span>next test</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-surface px-1.5 py-0.5 rounded border border-gray-900 text-secondary font-sans">
            esc
          </kbd>
          <span>restart</span>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-secondary text-xs font-medium mb-1">{label}</span>
      <span className="text-text text-xl font-semibold tabular-nums">
        {value}
      </span>
      {subValue && (
        <span className="text-secondary text-xs mt-0.5">{subValue}</span>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}s`;
}
