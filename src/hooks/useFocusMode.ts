import { useEffect, useRef, useCallback } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";

/**
 * Manages focus mode during typing test
 * - Enables focus mode when typing starts (hides UI elements)
 * - Disables focus mode on mouse movement (shows UI again)
 * - Test continues regardless of focus mode state
 *
 * Based on Monkeytype's focus.ts implementation
 */
export function useFocusMode() {
  const isActive = useTypingStore((s) => s.isActive);
  const isFinished = useTypingStore((s) => s.isFinished);
  const setFocused = useFocusModeStore((s) => s.setFocused);
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const setHideCursor = useFocusModeStore((s) => s.setHideCursor);

  // Threshold for unfocus - requires intentional mouse movement (like Monkeytype)
  const UNFOCUS_THRESHOLD_PX = 3;
  const initialPositionSet = useRef(false);

  // Enable focus mode when test becomes active
  useEffect(() => {
    if (isActive && !isFinished) {
      setFocused(true);
      setHideCursor(true);
      initialPositionSet.current = false;
    }
  }, [isActive, isFinished, setFocused, setHideCursor]);

  // Disable focus mode when test finishes or restarts
  useEffect(() => {
    if (isFinished || !isActive) {
      setFocused(false);
      setHideCursor(false);
      initialPositionSet.current = false;
    }
  }, [isFinished, isActive, setFocused, setHideCursor]);

  // Mouse movement handler - exit focus mode but don't stop test
  useEffect(() => {
    if (!isActive || isFinished || !isFocused) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      // Ignore first movement to capture initial position
      if (!initialPositionSet.current) {
        initialPositionSet.current = true;
        return;
      }

      // Check if movement exceeds threshold (prevents accidental unfocus from desk vibration)
      if (
        Math.abs(event.movementX) > UNFOCUS_THRESHOLD_PX ||
        Math.abs(event.movementY) > UNFOCUS_THRESHOLD_PX
      ) {
        // Exit focus mode - show UI again
        setFocused(false);
        setHideCursor(false);
        // Note: Test continues - we just show the UI
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive, isFinished, isFocused, setFocused, setHideCursor]);

  // Re-enable focus mode when user resumes typing
  const enableFocusMode = useCallback(() => {
    if (isActive && !isFinished) {
      setFocused(true);
      setHideCursor(true);
      initialPositionSet.current = false;
    }
  }, [isActive, isFinished, setFocused, setHideCursor]);

  return {
    isFocused,
    enableFocusMode,
  };
}
