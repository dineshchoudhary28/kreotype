import { z } from "zod/v4";

const charStatsSchema = z.object({
  correct: z.number().int().min(0),
  incorrect: z.number().int().min(0),
  extra: z.number().int().min(0),
  missed: z.number().int().min(0),
});

const keypressTimingsSchema = z.object({
  spacing: z.array(z.number()),
  duration: z.array(z.number()),
  keyOverlap: z.number(),
  startToFirstKey: z.number(),
  lastKeyToEnd: z.number(),
});

const validationSchema = z.object({
  isValid: z.boolean(),
  invalidReasons: z.array(z.string()),
});

export const completedEventSchema = z.object({
  wpm: z.number().min(0),
  rawWpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  keyConsistency: z.number().min(0).max(100),
  mode: z.enum(["time", "words", "quote", "zen"]),
  mode2: z.union([z.number(), z.string()]),
  timestamp: z.number(),
  testDuration: z.number().positive(),
  afkDuration: z.number().min(0),
  charStats: charStatsSchema,
  keypressTimings: keypressTimingsSchema,
  wpmHistory: z.array(z.number()),
  rawHistory: z.array(z.number()),
  burstHistory: z.array(z.number()),
  errorHistory: z.array(z.number()),
  language: z.string(),
  difficulty: z.string(),
  punctuation: z.boolean(),
  numbers: z.boolean(),
  blindMode: z.boolean(),
  validation: validationSchema,
  tags: z.array(z.string()).max(10).optional(),
});

export type CompletedEventInput = z.infer<typeof completedEventSchema>;
