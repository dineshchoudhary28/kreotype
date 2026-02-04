import { useEffect } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";

/**
 * Detects window blur/visibility changes during active typing test
 * Uses both blur events and Visibility API for comprehensive detection
 * Stores detection in InputHistoryStore for validation
 */
export function useWindowBlurDetection() {
  const isActive = useTypingStore((s) => s.isActive);
  const isFinished = useTypingStore((s) => s.isFinished);
  const setWindowBlurred = useInputHistoryStore((s) => s.setWindowBlurred);

  useEffect(() => {
    // Reset on test start/restart
    if (isActive && !isFinished) {
      setWindowBlurred(false);
    }
  }, [isActive, isFinished, setWindowBlurred]);

  useEffect(() => {
    if (!isActive || isFinished) {
      return;
    }

    const handleBlur = () => {
      setWindowBlurred(true);
      if (process.env.NODE_ENV === "development") {
        console.warn("[Anti-cheat] Window blur detected (Alt+Tab or focus loss)");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWindowBlurred(true);
        if (process.env.NODE_ENV === "development") {
          console.warn("[Anti-cheat] Window became hidden (Alt+Tab)");
        }
      }
    };

    // Listen for both blur and visibility change
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, isFinished, setWindowBlurred]);
}
