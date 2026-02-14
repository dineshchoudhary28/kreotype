import { z } from "zod";

const socialProfilesSchema = z.object({
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
}).optional();

export const updateProfileSchema = z.object({
  bio: z.string().max(250, "Bio must be 250 characters or less").optional(),
  keyboard: z.string().max(75, "Keyboard must be 75 characters or less").optional(),
  socialProfiles: socialProfilesSchema,
});

export const profileQuerySchema = z.object({
  include: z.array(z.string()).optional(),
});
