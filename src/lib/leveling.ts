/**
 * Constants for the leveling system.
 * BASE_XP: The XP required for level 1.
 * GROWTH_FACTOR: How much the required XP increases per level.
 */
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

/**
 * Calculates the total XP required to reach a specific level.
 * @param level The target level.
 * @returns The total XP required for that level.
 */
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Geometric progression formula for total XP
  return Math.floor(BASE_XP * (Math.pow(GROWTH_FACTOR, level - 1) - 1) / (GROWTH_FACTOR - 1));
}

interface LevelData {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  progress: number;
  totalXpForCurrentLevel: number;
  totalXpForNextLevel: number;
}

/**
 * Calculates a user's level and progress based on their total XP.
 * @param totalXp The user's total experience points.
 * @returns An object with detailed level information.
 */
export function calculateLevel(totalXp: number): LevelData {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }

  const totalXpForCurrentLevel = xpForLevel(level);
  const totalXpForNextLevel = xpForLevel(level + 1);

  const xpInLevel = totalXp - totalXpForCurrentLevel;
  const xpForNextLevel = totalXpForNextLevel - totalXpForCurrentLevel;

  const progress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;

  return {
    level,
    xpInLevel,
    xpForNextLevel,
    progress,
    totalXpForCurrentLevel,
    totalXpForNextLevel,
  };
}
