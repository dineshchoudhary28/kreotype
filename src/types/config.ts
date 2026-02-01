import { z } from "zod";

export const configSchema = z.object({
  mode: z.enum(["time", "words", "quote", "zen"]),
  time: z.number().int().positive(),
  words: z.number().int().positive(),
  punctuation: z.boolean(),
  numbers: z.boolean(),
  language: z.string(),
  difficulty: z.enum(["normal", "expert", "master"]),
  blindMode: z.boolean(),
  caretStyle: z.enum(["line", "block", "underline", "off"]),
  smoothCaret: z.boolean(),
  timerStyle: z.enum(["mini", "bar", "text", "off"]),
  liveSpeedStyle: z.enum(["mini", "text", "off"]),
  liveAccStyle: z.enum(["mini", "text", "off"]),
  liveBurstStyle: z.enum(["mini", "text", "off"]),
  stopOnError: z.enum(["off", "letter", "word"]),
  highlightMode: z.enum(["letter", "word", "off"]),
  fontSize: z.number(),
  confidenceMode: z.enum(["off", "on", "max"]),
  freedomMode: z.boolean(),
  quickRestart: z.enum(["off", "tab", "esc"]),
  showAllLines: z.boolean(),
  soundVolume: z.number().min(0).max(1),
  soundOnClick: z.enum(["off", "1", "2", "3", "4", "5", "6", "7"]),
  soundOnError: z.enum(["off", "1", "2", "3"]),
  theme: z.string(),
  fontFamily: z.string(),
  pageWidth: z.enum(["100", "125", "150", "200", "max"]),
  keyTips: z.boolean(),
  outOfFocusWarning: z.boolean(),
  capsLockWarning: z.boolean(),
  indicateTypos: z.enum(["off", "below", "replace"]),
  lazyMode: z.boolean(),
  smoothLineScroll: z.boolean(),
  colorfulMode: z.boolean(),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  mode: "time",
  time: 30,
  words: 50,
  punctuation: false,
  numbers: false,
  language: "english",
  difficulty: "normal",
  blindMode: false,
  caretStyle: "line",
  smoothCaret: true,
  timerStyle: "mini",
  liveSpeedStyle: "mini",
  liveAccStyle: "off",
  liveBurstStyle: "off",
  stopOnError: "off",
  highlightMode: "letter",
  fontSize: 1.5,
  confidenceMode: "off",
  freedomMode: false,
  quickRestart: "tab",
  showAllLines: false,
  soundVolume: 0.5,
  soundOnClick: "off",
  soundOnError: "off",
  theme: "serika_dark",
  fontFamily: "roboto_mono",
  pageWidth: "100",
  keyTips: true,
  outOfFocusWarning: true,
  capsLockWarning: true,
  indicateTypos: "off",
  lazyMode: false,
  smoothLineScroll: true,
  colorfulMode: false,
};

export const DEFAULT_CONFIG = defaultConfig; // Alias for compatibility if needed elsewhere

export function mergeWithDefaults(partial: Partial<Config>): Config {
  const merged = { ...defaultConfig };
  for (const key of Object.keys(defaultConfig) as (keyof Config)[]) {
    if (key in partial && partial[key] !== undefined) {
      (merged as Record<string, unknown>)[key] = partial[key];
    }
  }
  return merged;
}