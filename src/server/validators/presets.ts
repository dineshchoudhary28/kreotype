import { z } from "zod";

export const updatePresetSchema = z.object({
  name: z.string().min(1).max(32).trim().optional(),
  config: z.object({
    mode: z.enum(["time", "words", "quote", "zen", "custom"]).optional(),
    mode2: z.union([z.string(), z.number()]).optional(),
    punctuation: z.boolean().optional(),
    numbers: z.boolean().optional(),
    blindMode: z.boolean().optional(),
    language: z.string().optional(),
    difficulty: z.string().optional(),
  }).optional(),
});
