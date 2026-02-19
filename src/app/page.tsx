"use client";

import { useEffect, useCallback } from "react";
import { TypingTestPage } from "@/components/features/typing-test/TypingTestPage";
import { TestConfig } from "@/components/features/typing-test/TestConfig";
import { SideConfigBar, SIDEBAR_STORAGE_KEY } from "@/components/layout/SideConfigBar";
import { useTypingTestStore } from "@/store/useTypingTestStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useConfigStore } from "@/store/useConfigStore";

export default function Home() {
  const isFinished = useTypingTestStore((s) => s.isFinished);
  const isActive = useTypingTestStore((s) => s.isActive);
  const showUITemporarily = useFocusModeStore((s) => s.showUITemporarily);
  const setShowUITemporarily = useFocusModeStore((s) => s.setShowUITemporarily);
  const sidebarExpanded = useConfigStore((s) => s.sidebarExpanded);
  const setConfig = useConfigStore((s) => s.setConfig);

  const toggleSidebar = () => {
    const n = !sidebarExpanded;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(n));
    setConfig("sidebarExpanded", n);
  };

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
      className="flex-1 min-h-0 relative w-full overflow-x-hidden flex flex-row"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <SideConfigBar />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto flex flex-col md:pl-0`}
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
              <TestConfig
                leftSlot={
                  <button
                    onClick={toggleSidebar}
                    onMouseDown={(e) => e.preventDefault()}
                    data-typing-safe=""
                    title={sidebarExpanded ? "Close config panel" : "Open config panel"}
                    className="hidden md:flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-xl border border-surface bg-surface text-secondary hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </button>
                }
              />
            </div>
          )}
          <TypingTestPage />
        </main>
      </div>
    </div>
  );
}
