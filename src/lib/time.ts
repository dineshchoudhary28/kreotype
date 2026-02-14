/**
 * Calculates the day of the year for a given date.
 * @param date The date object.
 * @returns The day of the year (1-366).
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Gets the year and day of the year for a given timestamp.
 * @param timestamp The Unix timestamp in milliseconds.
 * @returns An object with the year and day of the year.
 */
export function getYearAndDay(timestamp: number): { year: number; dayOfYear: number } {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const dayOfYear = getDayOfYear(date);
  return { year, dayOfYear };
}
