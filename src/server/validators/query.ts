import { z } from "zod/v4";

/**
 * Query parameter validation schemas
 */

export const paginationQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : 25),
});

export const resultsQuerySchema = paginationQuerySchema.extend({
    mode: z.enum(["time", "words", "zen"]).optional(),
});

export const leaderboardQuerySchema = z.object({
    mode: z.enum(["time", "words", "zen"]),
    mode2: z.string(),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? Math.min(100, parseInt(val) || 50) : 50),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ResultsQuery = z.infer<typeof resultsQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
