import { z } from "zod/v4";

/**
 * Query parameter validation schemas
 */

export const paginationQuerySchema = z.object({
    cursor: z.string().nullable().optional().transform(val => val ?? undefined),
    limit: z.string().regex(/^\d+$/).nullable().optional().transform(val => val ? parseInt(val) : 25),
});

export const resultsQuerySchema = paginationQuerySchema.extend({
    mode: z.enum(["time", "words", "zen"]).nullable().optional().transform(val => val ?? undefined),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ResultsQuery = z.infer<typeof resultsQuerySchema>;
