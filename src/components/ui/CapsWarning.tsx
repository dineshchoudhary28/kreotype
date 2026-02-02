"use client";

import { useConfigStore } from "@/store/useConfigStore";

interface CapsWarningProps {
  capsLockOn: boolean;
}

export function CapsWarning({ capsLockOn }: CapsWarningProps) {
  const capsLockWarning = useConfigStore((s) => s.capsLockWarning);

  if (!capsLockWarning || !capsLockOn) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-[var(--error)] text-sm py-1 animate-pulse">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 12h5v8h10v-8h5L12 2z" />
        <line x1="8" y1="22" x2="16" y2="22" />
      </svg>
      <span>Caps Lock</span>
    </div>
  );
}
