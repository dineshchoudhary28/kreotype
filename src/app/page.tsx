"use client";

import { useEffect, useCallback } from "react";
import { TypingTestPage } from "@/components/features/typing-test/TypingTestPage";
import { TestConfig } from "@/components/features/typing-test/TestConfig";
import { useTypingTestStore } from "@/store/useTypingTestStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";

export default function Home() {
  const isFinished = useTypingTestStore((s) => s.isFinished);
  const isActive = useTypingTestStore((s) => s.isActive);
  const showUITemporarily = useFocusModeStore((s) => s.showUITemporarily);
  const setShowUITemporarily = useFocusModeStore((s) => s.setShowUITemporarily);

  // Determine if UI should be shown
  // Show UI when: not typing, showing results, or mouse/touch moved during typing
  const shouldShowUI = !isActive || isFinished || showUITemporarily;

  // Handle mouse movement or touch — show UI until user types again
  const handleInteraction = useCallback(() => {
    if (isActive && !isFinished) {
      setShowUITemporarily(true);
    }
  }, [isActive, isFinished, setShowUITemporarily]);

  // Reset showUITemporarily when test ends
  useEffect(() => {
    if (!isActive) {
      setShowUITemporarily(false);
    }
  }, [isActive, setShowUITemporarily]);

  return (
    <div
      className="flex-1 relative w-full overflow-x-hidden flex flex-col"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Sidebar: Hidden on mobile, hidden when typing (unless mouse moved) or showing results */}
      {/* {shouldShowUI && !isFinished && (
        <div className="hidden md:block absolute left-0 top-0 bottom-0 z-40">
          <SideConfigBar />
        </div>
      )} */}

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto flex flex-col w-full md:pl-0`}
      >
        <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 md:px-6 pt-4 md:pt-6 flex flex-col">
          {!isFinished && (
            <div
              className="transition-opacity duration-200"
              style={{
                opacity: shouldShowUI ? 1 : 0,
                visibility: shouldShowUI ? "visible" : "hidden",
                pointerEvents: shouldShowUI ? "auto" : "none",
              }}
            >
              <TestConfig />
            </div>
          )}
          <TypingTestPage />
        </main>
      </div>
    </div>
  );
}
