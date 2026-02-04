/**
 * Mouse movement detection is now handled by useFocusMode hook
 * Mouse movement during test → exits focus mode (shows UI) but test continues
 *
 * This file is kept for backwards compatibility but the actual anti-cheat
 * has been moved to:
 * - Window blur detection (Alt+Tab)
 * - Alt key tracking
 * - Timing analysis
 * - WPM validation
 *
 * Mouse movement is expected UX behavior now, not flagged as anti-cheat.
 */
export function useMouseDetection() {
  // No-op: Focus mode handles mouse movement detection
  // Kept for backwards compatibility in case components still import it
}
