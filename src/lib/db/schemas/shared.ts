import { z } from "zod";

/**
 * Utility Schemas
 */

// String that represents a number (e.g., "15", "30", "60")
export const StringNumberSchema = z.string().regex(/^\d+$/);

// MongoDB ObjectId as string
export const IdSchema = z.string().regex(/^[0-9a-f]{24}$/);

// Percentage value (0-100)
export const PercentageSchema = z.number().min(0).max(100);

// WPM (Words Per Minute)
export const WpmSchema = z.number().nonnegative();

/**
 * Shared Enums and Types
 */

// Test difficulty levels
export const DifficultySchema = z.enum(["normal", "expert", "master"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

// Test modes
export const ModeSchema = z.enum(["time", "words", "zen"]);
export type Mode = z.infer<typeof ModeSchema>;

// Mode2 values (mode-specific configuration)
export const Mode2Schema = z.union([
    StringNumberSchema,
    z.literal("zen"),
]);
export type Mode2 = z.infer<typeof Mode2Schema>;

// Language code (simplified - can be extended)
export const LanguageSchema = z.string().min(2).max(20);
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Personal Best Schema
 */

export const PersonalBestSchema = z.object({
    wpm: WpmSchema,
    acc: PercentageSchema,
    raw: WpmSchema,
    consistency: PercentageSchema,
    difficulty: DifficultySchema,
    language: LanguageSchema,
    timestamp: z.number().int().nonnegative(),
    lazyMode: z.boolean().optional(),
    punctuation: z.boolean().optional(),
    numbers: z.boolean().optional(),
});
export type PersonalBest = z.infer<typeof PersonalBestSchema>;

/**
 * Personal Bests Collection (by mode)
 */

export const PersonalBestsSchema = z.object({
    time: z.record(z.string(), z.array(PersonalBestSchema)),
    words: z.record(z.string(), z.array(PersonalBestSchema)),
    zen: z.record(z.string(), z.array(PersonalBestSchema)),
});
export type PersonalBests = z.infer<typeof PersonalBestsSchema>;

/**
 * Chart Data Schema
 */

export const ChartDataSchema = z.object({
    wpm: z.array(z.number().nonnegative()).max(122),
    burst: z.array(z.number().int().nonnegative()).max(122),
    err: z.array(z.number().nonnegative()).max(122),
});
export type ChartData = z.infer<typeof ChartDataSchema>;

/**
 * Character Statistics
 * [correct, incorrect, extra, missed]
 */

export const CharStatsSchema = z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
]);
export type CharStats = z.infer<typeof CharStatsSchema>;

/**
 * Key Statistics (for advanced metrics)
 */

export const KeyStatsSchema = z.object({
    average: z.number().nonnegative(),
    sd: z.number().nonnegative(), // Standard deviation
});
export type KeyStats = z.infer<typeof KeyStatsSchema>;

/**
 * Test Activity (heatmap data)
 * Record of year -> array of test counts by day
 */

export const CountByYearAndDaySchema = z.record(
    StringNumberSchema.describe("year"),
    z.array(
        z
            .number()
            .int()
            .nonnegative()
            .nullable()
            .describe("number of tests, position in array is day of year")
    )
);
export type CountByYearAndDay = z.infer<typeof CountByYearAndDaySchema>;

/**
 * Helper function to create empty PersonalBests object
 */

export function createEmptyPersonalBests(): PersonalBests {
    return {
        time: {},
        words: {},
        zen: {},
    };
}

/**
 * Helper function to create empty test activity
 */

export function createEmptyTestActivity(): CountByYearAndDay {
    return {};
}
