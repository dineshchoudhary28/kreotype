import { z } from "zod/v4";

export const profileQuerySchema = z.object({
  include: z
    .string()
    .transform((s) => s.split(",").map((v) => v.trim()))
    .pipe(z.array(z.enum(["activity", "recentTests"])))
    .optional(),
});

export type ProfileQueryInput = z.infer<typeof profileQuerySchema>;
