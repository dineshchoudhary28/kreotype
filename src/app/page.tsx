"use client";

import { useEffect, useRef, useCallback } from "react";
import { TypingTestPage } from "@/components/features/typing-test/TypingTestPage";
import { TestConfig } from "@/components/features/typing-test/TestConfig";
import { useTypingTestStore } from "@/store/useTypingTestStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";

const MOUSE_IDLE_TIMEOUT = 2000; // Hide UI after 2 seconds of no mouse movement

export default function Home() {
  const isFinished = useTypingTestStore((s) => s.isFinished);
  const isActive = useTypingTestStore((s) => s.isActive);
  const showUITemporarily = useFocusModeStore((s) => s.showUITemporarily);
  const setShowUITemporarily = useFocusModeStore((s) => s.setShowUITemporarily);

  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if UI should be shown
  // Show UI when: not typing, showing results, or mouse moved recently during typing
  const shouldShowUI = !isActive || isFinished || showUITemporarily;

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    if (isActive && !isFinished) {
      // Show UI temporarily
      setShowUITemporarily(true);

      // Clear existing timeout
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }

      // Set timeout to hide UI after idle period
      mouseTimeoutRef.current = setTimeout(() => {
        setShowUITemporarily(false);
      }, MOUSE_IDLE_TIMEOUT);
    }
  }, [isActive, isFinished, setShowUITemporarily]);

  // Reset showUITemporarily when test ends or starts
  useEffect(() => {
    if (!isActive) {
      setShowUITemporarily(false);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
        mouseTimeoutRef.current = null;
      }
    }
  }, [isActive, setShowUITemporarily]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex-1 relative w-full overflow-x-hidden flex flex-col"
      onMouseMove={handleMouseMove}
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
          {shouldShowUI && !isFinished && <TestConfig />}
          <TypingTestPage />
        </main>
      </div>
    </div>
  );
}
