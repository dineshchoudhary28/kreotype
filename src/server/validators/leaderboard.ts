import { z } from "zod/v4";

export const leaderboardQuerySchema = z.object({
  type: z.enum(["allTime", "weekly", "daily"]).default("allTime"),
  mode: z.string().default("time"),
  mode2: z.string().default("15"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
