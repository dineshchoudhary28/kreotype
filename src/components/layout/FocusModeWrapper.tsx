"use client";

import { useFocusModeStore } from "@/store/useFocusModeStore";

interface FocusModeWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that applies focus mode styles (cursor hiding)
 * to the entire page during active typing
 */
export function FocusModeWrapper({ children }: FocusModeWrapperProps) {
  const hideCursor = useFocusModeStore((s) => s.hideCursor);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ cursor: hideCursor ? "none" : undefined }}
    >
      {children}
    </div>
  );
}
