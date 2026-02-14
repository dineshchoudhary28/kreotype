/**
 * Calculates the day number for a given timestamp and timezone offset.
 * The day number is the number of days since the Unix epoch.
 *
 * @param timestamp The Unix timestamp in milliseconds.
 * @param hourOffset The user's timezone offset in hours from UTC.
 * @returns The day number.
 */
function getDayNumber(timestamp: number, hourOffset: number): number {
  // Adjust timestamp for the user's timezone
  const adjustedTimestamp = timestamp + hourOffset * 60 * 60 * 1000;
  // Get the day number by dividing by milliseconds in a day and flooring
  return Math.floor(adjustedTimestamp / (24 * 60 * 60 * 1000));
}

interface StreakData {
  streak: number;
  maxStreak: number;
  lastResultTimestamp: number;
}

/**
 * Calculates the user's new streak based on the last result.
 *
 * @param lastResultTimestamp The timestamp of the user's last result.
 * @param currentStreak The user's current streak.
 * @param maxStreak The user's maximum streak.
 * @param streakHourOffset The user's timezone offset for daily streak calculation.
 * @param newResultTimestamp The timestamp of the new result.
 * @returns An object with the updated streak data.
 */
export function calculateStreak(
  lastResultTimestamp: number | null,
  currentStreak: number,
  maxStreak: number,
  streakHourOffset: number,
  newResultTimestamp: number
): StreakData {
  const newTimestamp = newResultTimestamp;

  if (lastResultTimestamp === null) {
    // First test ever, start of a new streak
    return {
      streak: 1,
      maxStreak: Math.max(maxStreak, 1),
      lastResultTimestamp: newTimestamp,
    };
  }

  const lastDay = getDayNumber(lastResultTimestamp, streakHourOffset);
  const currentDay = getDayNumber(newTimestamp, streakHourOffset);

  const dayDifference = currentDay - lastDay;

  let newStreak = currentStreak;

  if (dayDifference === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (dayDifference > 1) {
    // Streak is broken
    newStreak = 1;
  } else if (dayDifference === 0) {
    // Same day, streak doesn't change
    // No action needed, newStreak is already currentStreak
  }

  const newMaxStreak = Math.max(maxStreak, newStreak);

  return {
    streak: newStreak,
    maxStreak: newMaxStreak,
    lastResultTimestamp: newTimestamp,
  };
}
