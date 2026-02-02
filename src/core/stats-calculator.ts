import { roundTo2, mean, stdDev, kogasa } from "@/lib/utils";

/**
 * WPM formula matching Monkeytype's whorf():
 * wpm = ((correctWordChars + correctSpaces) * (60 / testSeconds)) / 5
 * raw = ((allCharsTyped) * (60 / testSeconds)) / 5
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
 * Accuracy: (correct / (correct + incorrect)) * 100
 */
export function calculateAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 100;
  return roundTo2((correct / total) * 100);
}

/**
 * Burst speed for a single word (ported from Monkeytype test-stats.ts calculateBurst):
 * burst = (wordLength / (timeToWriteMs / 1000)) / 5 * 60
 */
export function calculateBurst(wordLength: number, timeToWriteMs: number): number {
  if (timeToWriteMs === 0 || wordLength === 0) return 0;
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
 * Matches Monkeytype's calculateAfkSeconds logic.
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

/**
 * Check if the last N seconds of a test were all AFK (no keypresses).
 * Used for result invalidation.
 */
export function wasAfkAtEnd(
  keypressCountHistory: number[],
  windowSeconds: number = 5
): boolean {
  if (keypressCountHistory.length < windowSeconds) return false;
  const lastN = keypressCountHistory.slice(-windowSeconds);
  return lastN.every((count) => count === 0);
}

/**
 * Calculate key overlap percentage (how often multiple keys are held simultaneously).
 * Higher overlap suggests touch typing proficiency.
 */
export function calculateKeyOverlap(
  overlapCount: number,
  totalKeydowns: number
): number {
  if (totalKeydowns === 0) return 0;
  return roundTo2((overlapCount / totalKeydowns) * 100);
}

/**
 * Calculate per-word burst speeds from word timing data.
 * Returns array of burst WPM values, one per completed word.
 */
export function calculateBurstPerWord(
  wordLengths: number[],
  wordTimingsMs: number[]
): number[] {
  const bursts: number[] = [];
  for (let i = 0; i < wordLengths.length && i < wordTimingsMs.length; i++) {
    bursts.push(calculateBurst(wordLengths[i]!, wordTimingsMs[i]!));
  }
  return bursts;
}

/**
 * Remove AFK data from history arrays (trim to test duration).
 * Matches Monkeytype's removeAfkData behavior.
 */
export function trimHistoryToSeconds(
  history: number[],
  testSeconds: number
): number[] {
  return history.slice(0, Math.ceil(testSeconds));
}

/**
 * Calculate final test stats in one call.
 * Convenience wrapper combining all stat calculations.
 */
export interface FinalStats {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  keyConsistency: number;
  afkDuration: number;
  keyOverlap: number;
}

export function calculateFinalStats(params: {
  correctWordChars: number;
  correctSpaces: number;
  allCharsTyped: number;
  testSeconds: number;
  correct: number;
  incorrect: number;
  rawPerSecond: number[];
  keypressSpacings: number[];
  keypressCountHistory: number[];
  overlapCount: number;
  totalKeydowns: number;
}): FinalStats {
  const { wpm, raw } = calculateWpmAndRaw(
    params.correctWordChars,
    params.correctSpaces,
    params.allCharsTyped,
    params.testSeconds
  );

  return {
    wpm: isNaN(wpm) ? 0 : wpm,
    raw: isNaN(raw) ? 0 : raw,
    accuracy: calculateAccuracy(params.correct, params.incorrect),
    consistency: calculateConsistency(params.rawPerSecond),
    keyConsistency: calculateKeyConsistency(params.keypressSpacings),
    afkDuration: calculateAfkDuration(params.keypressCountHistory, params.testSeconds),
    keyOverlap: calculateKeyOverlap(params.overlapCount, params.totalKeydowns),
  };
}
