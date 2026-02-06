import { z } from "zod";
import { ObjectId } from "mongodb";
import {
    IdSchema,
    ModeSchema,
    Mode,
    Mode2Schema,
    DifficultySchema,
    Difficulty,
    LanguageSchema,
    WpmSchema,
    PercentageSchema,
    CharStatsSchema,
    ChartDataSchema,
    ChartData,
    KeyStatsSchema,
} from "./shared";

/**
 * Result Schema (for validation)
 */

export const ResultSchema = z.object({
    uid: IdSchema,
    name: z.string(),

    // Test configuration
    mode: ModeSchema,
    mode2: Mode2Schema,
    language: LanguageSchema.optional(),
    difficulty: DifficultySchema.optional(),
    funbox: z.array(z.string()).optional(),
    punctuation: z.boolean().optional(),
    numbers: z.boolean().optional(),
    lazyMode: z.boolean().optional(),
    blindMode: z.boolean().optional(),
    quoteLength: z.number().int().min(0).max(3).optional(),

    // Performance metrics
    wpm: WpmSchema,
    rawWpm: WpmSchema,
    acc: PercentageSchema.min(50),
    consistency: PercentageSchema,
    keyConsistency: PercentageSchema,
    charStats: CharStatsSchema,

    // Timing data
    timestamp: z.number().int().nonnegative(),
    testDuration: z.number().min(1),
    restartCount: z.number().int().nonnegative().optional(),
    incompleteTestSeconds: z.number().nonnegative().optional(),
    afkDuration: z.number().nonnegative().optional(),

    // Chart data
    chartData: ChartDataSchema.or(z.literal("toolong")),

    // Advanced stats (optional)
    keySpacingStats: KeyStatsSchema.optional(),
    keyDurationStats: KeyStatsSchema.optional(),

    // Metadata
    tags: z.array(IdSchema).optional(),
    isPb: z.boolean().optional(),
    bailedOut: z.boolean().optional(),

    // Legacy fields (for backward compatibility)
    correctChars: z.number().optional(),
    incorrectChars: z.number().optional(),
});
export type Result = z.infer<typeof ResultSchema>;

/**
 * Database Result Type (includes MongoDB _id)
 */

export interface DBResult extends Result {
    _id: ObjectId;
}

/**
 * Completed Event Schema (client submission)
 * This is what the client sends when completing a test
 */

export const CompletedEventSchema = z.object({
    uid: z.string(),

    // Test configuration
    mode: ModeSchema,
    mode2: Mode2Schema,
    language: LanguageSchema,
    difficulty: DifficultySchema,
    funbox: z.array(z.string()),
    punctuation: z.boolean(),
    numbers: z.boolean(),
    lazyMode: z.boolean(),
    blindMode: z.boolean(),
    quoteLength: z.number().int().min(0).max(3).optional(),

    // Performance metrics
    wpm: WpmSchema,
    rawWpm: WpmSchema,
    acc: PercentageSchema.min(50),
    consistency: PercentageSchema,
    keyConsistency: PercentageSchema,
    charStats: CharStatsSchema,

    // Timing data
    timestamp: z.number().int().nonnegative(),
    testDuration: z.number().min(1),
    restartCount: z.number().int().nonnegative(),
    incompleteTestSeconds: z.number().nonnegative(),
    afkDuration: z.number().nonnegative(),

    // Chart data
    chartData: ChartDataSchema.or(z.literal("toolong")),

    // Advanced stats
    keySpacing: z.array(z.number().nonnegative()).or(z.literal("toolong")).optional(),
    keyDuration: z.array(z.number().nonnegative()).or(z.literal("toolong")).optional(),

    // Metadata
    tags: z.array(IdSchema),
    bailedOut: z.boolean(),

    // Hash for deduplication
    hash: z.string().max(100),
});
export type CompletedEvent = z.infer<typeof CompletedEventSchema>;

/**
 * Helper function to build a DBResult from a CompletedEvent
 */

export function buildDbResult(
    completedEvent: CompletedEvent,
    userName: string,
    isPb: boolean
): Omit<DBResult, "_id"> {
    const ce = completedEvent;
    const result: Omit<DBResult, "_id"> = {
        uid: ce.uid,
        name: userName,
        wpm: ce.wpm,
        rawWpm: ce.rawWpm,
        charStats: ce.charStats,
        acc: ce.acc,
        mode: ce.mode,
        mode2: ce.mode2,
        timestamp: ce.timestamp,
        testDuration: ce.testDuration,
        consistency: ce.consistency,
        keyConsistency: ce.keyConsistency,
        chartData: ce.chartData,
        language: ce.language,
        lazyMode: ce.lazyMode,
        difficulty: ce.difficulty,
        funbox: ce.funbox,
        numbers: ce.numbers,
        punctuation: ce.punctuation,
        restartCount: ce.restartCount,
        incompleteTestSeconds: ce.incompleteTestSeconds,
        afkDuration: ce.afkDuration,
        tags: ce.tags,
        isPb: isPb,
        bailedOut: ce.bailedOut,
        blindMode: ce.blindMode,
    };

    // Calculate key stats if data is available
    if (ce.keySpacing && ce.keySpacing !== "toolong") {
        const avg = ce.keySpacing.reduce((a, b) => a + b, 0) / ce.keySpacing.length;
        const variance =
            ce.keySpacing.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
            ce.keySpacing.length;
        result.keySpacingStats = {
            average: avg,
            sd: Math.sqrt(variance),
        };
    }

    if (ce.keyDuration && ce.keyDuration !== "toolong") {
        const avg = ce.keyDuration.reduce((a, b) => a + b, 0) / ce.keyDuration.length;
        const variance =
            ce.keyDuration.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
            ce.keyDuration.length;
        result.keyDurationStats = {
            average: avg,
            sd: Math.sqrt(variance),
        };
    }

    // Compress object by omitting default values
    if (!ce.quoteLength) delete result.quoteLength;
    if (!ce.bailedOut) delete result.bailedOut;
    if (!ce.blindMode) delete result.blindMode;
    if (!ce.lazyMode) delete result.lazyMode;
    if (ce.difficulty === "normal") delete result.difficulty;
    if (ce.funbox.length === 0) delete result.funbox;
    if (ce.language === "english") delete result.language;
    if (!ce.numbers) delete result.numbers;
    if (!ce.punctuation) delete result.punctuation;
    if (ce.mode !== "quote") delete result.quoteLength;
    if (ce.restartCount === 0) delete result.restartCount;
    if (ce.incompleteTestSeconds === 0) delete result.incompleteTestSeconds;
    if (ce.afkDuration === 0) delete result.afkDuration;
    if (ce.tags.length === 0) delete result.tags;
    if (result.isPb === false) delete result.isPb;

    return result;
}

/**
 * Helper function to replace legacy values in a result
 */

export function replaceLegacyValues(result: DBResult): DBResult {
    // Convert legacy correctChars/incorrectChars to charStats
    if (result.correctChars !== undefined && result.incorrectChars !== undefined) {
        if (result.charStats !== undefined) {
            result.charStats = [
                result.charStats[0],
                result.charStats[1],
                result.charStats[2],
                result.charStats[3],
            ];
            delete result.correctChars;
            delete result.incorrectChars;
        } else {
            result.charStats = [result.correctChars, result.incorrectChars, 0, 0];
            delete result.correctChars;
            delete result.incorrectChars;
        }
    }

    return result;
}
