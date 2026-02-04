import { useEffect } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useInputHistoryStore } from "@/store/useInputHistoryStore";

/**
 * Tracks Alt key state during typing test for anti-cheat purposes
 * Alt+Tab is commonly used to switch windows, indicating potential cheating
 *
 * Based on Monkeytype's alt-tracker.ts implementation
 */

let leftAltState = false;
let rightAltState = false;

export function useAltTracker() {
  const isActive = useTypingStore((s) => s.isActive);
  const isFinished = useTypingStore((s) => s.isFinished);
  const setWindowBlurred = useInputHistoryStore((s) => s.setWindowBlurred);

  useEffect(() => {
    // Reset state on test start
    if (isActive && !isFinished) {
      leftAltState = false;
      rightAltState = false;
    }
  }, [isActive, isFinished]);

  useEffect(() => {
    if (!isActive || isFinished) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "AltLeft") {
        leftAltState = true;
        // Alt key pressed likely means Alt+Tab coming
        if (process.env.NODE_ENV === "development") {
          console.log("[Anti-cheat] AltLeft pressed");
        }
      } else if (e.code === "AltRight") {
        rightAltState = true;
        if (process.env.NODE_ENV === "development") {
          console.log("[Anti-cheat] AltRight pressed");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "AltLeft") {
        // If Alt was pressed and released without Tab, it's likely Alt+Tab occurred
        if (leftAltState) {
          // Only flag if the window also lost focus
          // The blur detection will handle the actual flagging
        }
        leftAltState = false;
      } else if (e.code === "AltRight") {
        rightAltState = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isActive, isFinished, setWindowBlurred]);
}

/**
 * Get current Alt key states (for external access if needed)
 */
export function getAltState() {
  return {
    left: leftAltState,
    right: rightAltState,
  };
}

/**
 * Reset Alt key states
 */
export function resetAltState() {
  leftAltState = false;
  rightAltState = false;
}
