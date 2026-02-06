import { z } from "zod";

export const configSchema = z.object({
  mode: z.enum(["time", "words", "zen"]),
  value: z.string(),
  punctuation: z.boolean(),
  numbers: z.boolean(),
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
  language: "english",
  sidebarExpanded: false,
  pageWidth: "150",
};

export function mergeWithDefaults(partial: Partial<Config>): Config {
  return { ...defaultConfig, ...partial };
}