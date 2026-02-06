import { z } from "zod";

export const configSchema = z.object({
  mode: z.enum(["time", "words", "quote", "zen", "custom"]),
  value: z.string(),
  punctuation: z.boolean(),
  numbers: z.boolean(),
  pattern: z.enum(["standard", "wave", "mountains"]),
  lineMode: z.enum(["single", "multi"]),
  language: z.string(),
  sidebarExpanded: z.boolean(),
  pageWidth: z.enum(["100", "125", "150", "200", "max"]),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  mode: "time",
  value: "30",
  punctuation: false,
  numbers: false,
  pattern: "standard",
  lineMode: "multi",
  language: "english",
  sidebarExpanded: false,
  pageWidth: "150",
};

export function mergeWithDefaults(partial: Partial<Config>): Config {
  return { ...defaultConfig, ...partial };
}