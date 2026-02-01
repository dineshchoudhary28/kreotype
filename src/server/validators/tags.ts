import { z } from "zod/v4";
import { configSchema } from "@/types/config";

export const createTagSchema = z.object({
  name: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
});

export const createPresetSchema = z.object({
  name: z.string().min(1).max(30),
  config: configSchema,
});

export const updatePresetSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  config: configSchema.optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreatePresetInput = z.infer<typeof createPresetSchema>;
export type UpdatePresetInput = z.infer<typeof updatePresetSchema>;
