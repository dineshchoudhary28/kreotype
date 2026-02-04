import type { Config } from "@/types/config";

/**
 * Convert pageWidth config value to Tailwind max-width class
 * Updated with wider defaults for better readability:
 * - 100: max-w-6xl (72rem / 1152px) - compact
 * - 125: max-w-7xl (80rem / 1280px) - comfortable default
 * - 150: max-w-screen-xl (80rem / 1280px) - spacious
 * - 200: max-w-screen-2xl (96rem / 1536px) - wide
 * - max: max-w-[1800px] (full width with reasonable max)
 */
export function getPageWidthClass(pageWidth: Config["pageWidth"]): string {
  const widthMap: Record<Config["pageWidth"], string> = {
    "100": "max-w-6xl",         // 1152px - was 1024px
    "125": "max-w-7xl",         // 1280px - was 1152px
    "150": "max-w-screen-xl",   // 1280px
    "200": "max-w-screen-2xl",  // 1536px
    max: "max-w-[1800px]",      // 1800px with reasonable cap
  };

  return widthMap[pageWidth];
}

/**
 * Get numeric max-width in pixels for CSS calculations
 */
export function getPageWidthPx(pageWidth: Config["pageWidth"]): number {
  const widthMap: Record<Config["pageWidth"], number> = {
    "100": 1152,
    "125": 1280,
    "150": 1280,
    "200": 1536,
    max: 1800,
  };

  return widthMap[pageWidth];
}
