import { type CompletedEventInput } from "@/server/validators/result";

/**
 * Calculates the amount of XP earned from a typing test.
 * The formula is a placeholder and can be adjusted for game balance.
 *
 * Current Formula:
 * - Base XP per character: 0.1
 * - Accuracy bonus: 1.0 to 1.5 (scales linearly from 90% to 100% accuracy)
 * - Difficulty multiplier: normal=1, expert=1.5, master=2
 * - Duration bonus: 1.0 to 2.0 (scales linearly from 15s to 120s test duration)
 */
export function calculateXp(data: CompletedEventInput, isValid: boolean): { xpGained: number } {
  if (!isValid) {
    return { xpGained: 0 };
  }

  const charactersTyped = data.charStats.correct + data.charStats.incorrect;
  const baseXP = charactersTyped * 0.1;

  // Accuracy bonus (1.0x at <=90%, 1.5x at 100%)
  const accuracyBonus = 1 + Math.max(0, (data.accuracy - 90) / 10) * 0.5;

  // Difficulty multiplier
  const difficultyMultipliers = {
    normal: 1,
    expert: 1.5,
    master: 2,
  };
  const difficultyMultiplier = difficultyMultipliers[data.difficulty] || 1;

  // Duration bonus (scales from 15s to 120s)
  const durationClamped = Math.max(15, Math.min(120, data.testDuration));
  const durationBonus = 1 + (durationClamped - 15) / (120 - 15);

  const xpGained = Math.round(
    baseXP * accuracyBonus * difficultyMultiplier * durationBonus
  );

  return { xpGained };
}
