import type { TestResult, TestValidation, TestMode } from "@/types/test";
import { wasAfkAtEnd } from "./stats-calculator";

const WPM_MAX = 350;
const WPM_MAX_SHORT = 420;
const ACCURACY_MIN = 50;
const MIN_TEST_DURATION = 1;
const TIMING_WPM_TOLERANCE = 0.15;
const MIN_SPACING_STDDEV = 5;
const DURATION_TOLERANCE = 0.20;
const AFK_END_WINDOW = 5;

interface ValidationContext {
  mode: TestMode;
  wordCount: number;
  timeConfig: number;
  keypressCountHistory?: number[];
  isRepeated?: boolean;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sq = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(sq);
}

export function validateResult(
  result: TestResult,
  context: ValidationContext
): TestValidation {
  const reasons: string[] = [];

  // WPM bounds (matching Monkeytype: 350 general, 420 for short word tests)
  const maxWpm = context.mode === "words" && context.wordCount <= 10 ? WPM_MAX_SHORT : WPM_MAX;
  if (result.wpm > maxWpm) {
    reasons.push(`WPM ${result.wpm} exceeds maximum ${maxWpm}`);
  }
  if (result.rawWpm > maxWpm) {
    reasons.push(`Raw WPM ${result.rawWpm} exceeds maximum ${maxWpm}`);
  }
  if (result.wpm < 0) {
    reasons.push("WPM is negative");
  }

  // Accuracy bounds
  if (result.accuracy < ACCURACY_MIN) {
    reasons.push(`Accuracy ${result.accuracy}% below minimum ${ACCURACY_MIN}%`);
  }
  if (result.accuracy > 100) {
    reasons.push("Accuracy exceeds 100%");
  }

  // Duration check
  if (result.time < MIN_TEST_DURATION) {
    reasons.push(`Test duration ${result.time}s below minimum ${MIN_TEST_DURATION}s`);
  }

  // AFK check: if more than half the test was AFK
  if (result.afkDuration > result.time * 0.5 && result.time > 5) {
    reasons.push(`AFK for ${result.afkDuration}s of ${result.time}s test`);
  }

  // AFK at end check (last 5 seconds all idle - from Monkeytype finish() validation)
  if (context.keypressCountHistory && context.keypressCountHistory.length >= AFK_END_WINDOW) {
    if (wasAfkAtEnd(context.keypressCountHistory, AFK_END_WINDOW)) {
      reasons.push(`AFK for last ${AFK_END_WINDOW} seconds of test`);
    }
  }

  // WPM consistency: WPM should not exceed raw
  if (result.wpm > result.rawWpm + 1) {
    reasons.push("WPM exceeds raw WPM");
  }

  // Repeated test invalidation
  if (context.isRepeated) {
    reasons.push("Result from repeated test - not eligible for leaderboard");
  }

  // --- Anti-cheat: Timing-WPM consistency ---
  const { spacing, startToFirstKey, lastKeyToEnd } = result.keypressTimings;
  if (spacing.length > 0) {
    const totalSpacingMs = spacing.reduce((a, b) => a + b, 0);
    const totalCharsTyped = result.charStats.correct + result.charStats.incorrect + result.charStats.extra;

    if (totalCharsTyped > 0 && totalSpacingMs > 0) {
      const totalSpacingSec = totalSpacingMs / 1000;
      const calculatedWpm = (totalCharsTyped / 5) * (60 / totalSpacingSec);

      if (
        result.wpm > 0 &&
        Math.abs(result.wpm - calculatedWpm) / result.wpm > TIMING_WPM_TOLERANCE
      ) {
        reasons.push(
          `Timing-WPM mismatch: reported ${result.wpm.toFixed(1)}, calculated ${calculatedWpm.toFixed(1)} from keypress spacing`
        );
      }
    }

    // --- Anti-cheat: Humanness check (spacing std deviation) ---
    const spacingStdDev = stddev(spacing);
    if (spacingStdDev < MIN_SPACING_STDDEV && spacing.length >= 10) {
      reasons.push(
        `Suspiciously uniform keypress spacing: stddev ${spacingStdDev.toFixed(2)}ms`
      );
    }

    // --- Anti-cheat: Duration sanity ---
    const reconstructedMs = totalSpacingMs + startToFirstKey + lastKeyToEnd;
    const reportedMs = result.time * 1000;
    if (
      reportedMs > 0 &&
      Math.abs(reconstructedMs - reportedMs) / reportedMs > DURATION_TOLERANCE
    ) {
      reasons.push(
        `Duration mismatch: reconstructed ${(reconstructedMs / 1000).toFixed(1)}s vs reported ${result.time.toFixed(1)}s`
      );
    }
  }

  // --- Anti-cheat: Minimum keystrokes ---
  const totalKeystrokes = result.charStats.correct + result.charStats.incorrect + result.charStats.extra;
  if (result.wpm > 0 && result.time > 0) {
    const expectedChars = (result.wpm * 5 * result.time) / 60;
    if (totalKeystrokes < expectedChars * 0.5) {
      reasons.push(
        `Insufficient keystrokes: ${totalKeystrokes} vs expected ~${Math.round(expectedChars)}`
      );
    }
  }

  return {
    isValid: reasons.length === 0,
    invalidReasons: reasons,
  };
}
