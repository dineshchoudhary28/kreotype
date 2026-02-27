import { z } from "zod";

export const configSchema = z.object({
  mode: z.enum(["time", "words", "zen"]),
  value: z.string(),
  punctuation: z.boolean(),
  numbers: z.boolean(),
  caseMode: z.enum(["normal", "upper", "lower"]),
  difficulty: z.enum(["normal", "expert", "master"]),
  caretStyle: z.enum(["off", "line", "block", "underline", "outline"]),
  smoothCaret: z.enum(["off", "slow", "medium", "fast"]),
  language: z.string(),
  sidebarExpanded: z.boolean(),
  pageWidth: z.enum(["100", "125", "150", "200", "max"]),
  singleLineMode: z.boolean(),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  mode: "time",
  value: "30",
  punctuation: false,
  numbers: false,
  caseMode: "lower",
  difficulty: "normal",
  caretStyle: "line",
  smoothCaret: "medium",
  language: "english",
  sidebarExpanded: false,
  pageWidth: "150",
  singleLineMode: false,
};

export function mergeWithDefaults(partial: Partial<Config>): Config {
  return { ...defaultConfig, ...partial };
}