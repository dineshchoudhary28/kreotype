import { z } from "zod/v4";

export const leaderboardQuerySchema = z.object({
  type: z.enum(["allTime", "weekly", "daily"]).default("allTime"),
  mode: z.enum(["time", "words", "quote", "zen"]).default("time"),
  mode2: z.string()
    .refine((val) => {
      // Allow specific numeric strings (common time/word counts)
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 1000;
    }, "mode2 must be a positive number up to 1000")
    .default("15"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
