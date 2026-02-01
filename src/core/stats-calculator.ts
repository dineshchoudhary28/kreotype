import { roundTo2, mean, stdDev, kogasa } from "@/lib/utils";

/**
 * WPM formula matching Monkeytype:
 * wpm = ((correctWordChars + correctSpaces) × (60 / testSeconds)) / 5
 * raw = ((allCharsTyped) × (60 / testSeconds)) / 5
 */
export function calculateWpmAndRaw(
  correctWordChars: number,
  correctSpaces: number,
  allCharsTyped: number,
  testSeconds: number
): { wpm: number; raw: number } {
  if (testSeconds === 0) return { wpm: 0, raw: 0 };
  const wpm = roundTo2(((correctWordChars + correctSpaces) * (60 / testSeconds)) / 5);
  const raw = roundTo2((allCharsTyped * (60 / testSeconds)) / 5);
  return { wpm: Math.max(0, wpm), raw: Math.max(0, raw) };
}

/**
 * Accuracy: (correct / (correct + incorrect)) × 100
 */
export function calculateAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 100;
  return roundTo2((correct / total) * 100);
}

/**
 * Burst speed for a single word:
 * burst = (wordLength / (endTime - burstStartTime)) / 5 * 60
 */
export function calculateBurst(wordLength: number, timeToWriteMs: number): number {
  if (timeToWriteMs === 0) return 0;
  const timeToWriteS = timeToWriteMs / 1000;
  return roundTo2((wordLength * (60 / timeToWriteS)) / 5);
}

/**
 * Consistency using Monkeytype's kogasa metric.
 * Uses stdDev/mean of raw WPM per-second samples, normalized via kogasa.
 */
export function calculateConsistency(rawPerSecond: number[]): number {
  if (rawPerSecond.length < 2) return 100;
  const sd = stdDev(rawPerSecond);
  const m = mean(rawPerSecond);
  if (m === 0) return 0;
  return kogasa(sd / m);
}

/**
 * Key consistency using kogasa on keypress spacing deviations.
 */
export function calculateKeyConsistency(keypressSpacings: number[]): number {
  if (keypressSpacings.length < 2) return 100;
  const sd = stdDev(keypressSpacings);
  const m = mean(keypressSpacings);
  if (m === 0) return 0;
  return kogasa(sd / m);
}

/**
 * Detect AFK seconds from keypress count history.
 * A second with 0 keypresses is considered AFK.
 */
export function calculateAfkDuration(
  keypressCountHistory: number[],
  testSeconds: number
): number {
  let afkSeconds = 0;
  for (const count of keypressCountHistory) {
    if (count === 0) afkSeconds++;
  }
  // Account for seconds not recorded (test ended mid-second)
  const extraSeconds = Math.ceil(testSeconds) - keypressCountHistory.length;
  if (extraSeconds > 0) afkSeconds += extraSeconds;
  return afkSeconds;
}
