import { z } from "zod/v4";
import { configSchema } from "@/types/config";

export const updateNameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  name: z.string().min(1).max(32).optional(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export { configSchema };

export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
