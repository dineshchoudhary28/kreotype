import type { Config } from "@/types/config";

export type SettingGroup =
  | "behavior"
  | "input"
  | "sound"
  | "caret"
  | "appearance"
  | "theme"
  | "hideElements"
  | "dangerZone";

export type ControlType = "select" | "buttonGroup" | "range" | "input" | "toggle";

export interface SettingOption {
  value: string | number | boolean;
  label: string;
}

export interface SettingMeta {
  key: keyof Config;
  group: SettingGroup;
  label: string;
  description: string;
  controlType: ControlType;
  options?: SettingOption[];
  range?: { min: number; max: number; step: number };
}

export interface SettingGroupMeta {
  id: SettingGroup;
  label: string;
  icon: string; // lucide icon name
  description: string;
}

export const settingGroups: SettingGroupMeta[] = [
  { id: "behavior", label: "behavior", icon: "Sliders", description: "Test difficulty, quick restart, and general behavior" },
  { id: "input", label: "input", icon: "Keyboard", description: "Input handling, freedom mode, and error behavior" },
  { id: "sound", label: "sound", icon: "Volume2", description: "Sound effects for clicks and errors" },
  { id: "caret", label: "caret", icon: "TextCursor", description: "Caret style, smooth caret, and pace caret" },
  { id: "appearance", label: "appearance", icon: "Eye", description: "Font, layout, and visual preferences" },
  { id: "theme", label: "theme", icon: "Palette", description: "Theme selection and color options" },
  { id: "hideElements", label: "hide elements", icon: "EyeOff", description: "Toggle visibility of UI elements" },
  { id: "dangerZone", label: "danger zone", icon: "AlertTriangle", description: "Reset settings and clear data" },
];

export const settingsMetadata: SettingMeta[] = [
  // ── Behavior ──
  {
    key: "difficulty",
    group: "behavior",
    label: "difficulty",
    description: "Normal: no changes. Expert: no backspace. Master: no backspace + fail on error.",
    controlType: "buttonGroup",
    options: [
      { value: "normal", label: "normal" },
      { value: "expert", label: "expert" },
      { value: "master", label: "master" },
    ],
  },
  {
    key: "blindMode",
    group: "behavior",
    label: "blind mode",
    description: "No error highlighting. You won't know what you got wrong until the end.",
    controlType: "toggle",
  },
  {
    key: "quickRestart",
    group: "behavior",
    label: "quick restart",
    description: "Press a key to quickly restart the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "tab", label: "tab" },
      { value: "esc", label: "esc" },
      { value: "enter", label: "enter" },
    ],
  },
  {
    key: "repeatQuotes",
    group: "behavior",
    label: "repeat quotes",
    description: "Keep typing the same quote after finishing.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "typing", label: "typing" },
    ],
  },
  {
    key: "oppositeShiftMode",
    group: "behavior",
    label: "opposite shift mode",
    description: "Force using the opposite shift key for uppercase letters.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "on", label: "on" },
      { value: "keymap", label: "keymap" },
    ],
  },
  {
    key: "quickEnd",
    group: "behavior",
    label: "quick end",
    description: "Test ends as soon as the last word is correct, no need to press space.",
    controlType: "toggle",
  },
  {
    key: "indicateTypos",
    group: "behavior",
    label: "indicate typos",
    description: "How to display typos in the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "below", label: "below" },
      { value: "replace", label: "replace" },
      { value: "both", label: "both" },
    ],
  },
  {
    key: "hideExtraLetters",
    group: "behavior",
    label: "hide extra letters",
    description: "Hides extra letters that are typed beyond the word length.",
    controlType: "toggle",
  },
  {
    key: "britishEnglish",
    group: "behavior",
    label: "british english",
    description: "Use British English spelling for quotes.",
    controlType: "toggle",
  },
  {
    key: "minSpeed",
    group: "behavior",
    label: "minimum speed",
    description: "Test will fail if your speed drops below this value (0 = off).",
    controlType: "range",
    range: { min: 0, max: 200, step: 10 },
  },
  {
    key: "minAccuracy",
    group: "behavior",
    label: "minimum accuracy",
    description: "Test will fail if your accuracy drops below this value (0 = off).",
    controlType: "range",
    range: { min: 0, max: 100, step: 5 },
  },
  {
    key: "minBurst",
    group: "behavior",
    label: "minimum burst",
    description: "Test will fail if a burst speed drops below this value (0 = off).",
    controlType: "range",
    range: { min: 0, max: 200, step: 10 },
  },
  {
    key: "minBurstMode",
    group: "behavior",
    label: "minimum burst mode",
    description: "Fixed: uses the set value. Flex: adjusts based on your average.",
    controlType: "buttonGroup",
    options: [
      { value: "fixed", label: "fixed" },
      { value: "flex", label: "flex" },
    ],
  },

  // ── Input ──
  {
    key: "freedomMode",
    group: "input",
    label: "freedom mode",
    description: "Allows you to delete any word, not just the current one.",
    controlType: "toggle",
  },
  {
    key: "strictSpace",
    group: "input",
    label: "strict space",
    description: "Pressing space at the beginning of a word will insert a space character.",
    controlType: "toggle",
  },
  {
    key: "confidenceMode",
    group: "input",
    label: "confidence mode",
    description: "Off: normal. On: can't go back to previous words. Max: can't use backspace at all.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "on", label: "on" },
      { value: "max", label: "max" },
    ],
  },
  {
    key: "stopOnError",
    group: "input",
    label: "stop on error",
    description: "Off: normal. Letter: stop on incorrect letter. Word: stop on incorrect word.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "letter", label: "letter" },
      { value: "word", label: "word" },
    ],
  },
  {
    key: "lazyMode",
    group: "input",
    label: "lazy mode",
    description: "Replaces accented letters with their unaccented equivalents.",
    controlType: "toggle",
  },
  {
    key: "highlightMode",
    group: "input",
    label: "highlight mode",
    description: "How to highlight the current position in the test.",
    controlType: "buttonGroup",
    options: [
      { value: "letter", label: "letter" },
      { value: "word", label: "word" },
      { value: "off", label: "off" },
    ],
  },
  {
    key: "compositionDisplay",
    group: "input",
    label: "composition display",
    description: "How to display composition (IME) input.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "below", label: "below" },
      { value: "replace", label: "replace" },
    ],
  },
  {
    key: "layoutEmulator",
    group: "input",
    label: "layout emulator",
    description: "Emulate a different keyboard layout.",
    controlType: "input",
  },
  {
    key: "keymapLayout",
    group: "input",
    label: "keymap layout",
    description: "The keyboard layout to use for the keymap.",
    controlType: "input",
  },
  {
    key: "codeUnindentOnBackspace",
    group: "input",
    label: "code unindent on backspace",
    description: "Pressing backspace at the start of an indented line will unindent.",
    controlType: "toggle",
  },

  // ── Sound ──
  {
    key: "soundVolume",
    group: "sound",
    label: "sound volume",
    description: "Volume of click and error sounds.",
    controlType: "range",
    range: { min: 0, max: 1, step: 0.1 },
  },
  {
    key: "soundOnClick",
    group: "sound",
    label: "sound on click",
    description: "Play a sound when a key is pressed.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
      { value: "7", label: "7" },
    ],
  },
  {
    key: "soundOnError",
    group: "sound",
    label: "sound on error",
    description: "Play a sound when a wrong key is pressed.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ],
  },

  // ── Caret ──
  {
    key: "caretStyle",
    group: "caret",
    label: "caret style",
    description: "The style of the caret displayed during the test.",
    controlType: "buttonGroup",
    options: [
      { value: "line", label: "line" },
      { value: "block", label: "block" },
      { value: "underline", label: "underline" },
      { value: "off", label: "off" },
    ],
  },
  {
    key: "smoothCaret",
    group: "caret",
    label: "smooth caret",
    description: "The caret will move smoothly between letters and words.",
    controlType: "toggle",
  },
  {
    key: "repeatedPace",
    group: "caret",
    label: "pace caret",
    description: "Show a second caret that moves at a constant speed.",
    controlType: "toggle",
  },
  {
    key: "paceCaretCustomSpeed",
    group: "caret",
    label: "pace caret speed",
    description: "The speed of the pace caret in WPM (0 = match your PB).",
    controlType: "range",
    range: { min: 0, max: 300, step: 5 },
  },

  // ── Appearance ──
  {
    key: "smoothLineScroll",
    group: "appearance",
    label: "smooth line scroll",
    description: "Lines will scroll smoothly when a new line is reached.",
    controlType: "toggle",
  },
  {
    key: "keyTips",
    group: "appearance",
    label: "show key tips",
    description: "Show keyboard shortcut tips at the bottom of the test.",
    controlType: "toggle",
  },
  {
    key: "liveSpeedStyle",
    group: "appearance",
    label: "live speed",
    description: "How to display live speed during the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "mini", label: "mini" },
      { value: "text", label: "text" },
    ],
  },
  {
    key: "liveAccStyle",
    group: "appearance",
    label: "live accuracy",
    description: "How to display live accuracy during the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "mini", label: "mini" },
      { value: "text", label: "text" },
    ],
  },
  {
    key: "liveBurstStyle",
    group: "appearance",
    label: "live burst",
    description: "How to display live burst speed during the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "mini", label: "mini" },
      { value: "text", label: "text" },
    ],
  },
  {
    key: "timerStyle",
    group: "appearance",
    label: "timer style",
    description: "How to display the timer during the test.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "mini", label: "mini" },
      { value: "bar", label: "bar" },
      { value: "text", label: "text" },
    ],
  },
  {
    key: "fontSize",
    group: "appearance",
    label: "font size",
    description: "The font size of the test words (in rem).",
    controlType: "range",
    range: { min: 1, max: 4, step: 0.25 },
  },
  {
    key: "fontFamily",
    group: "appearance",
    label: "font family",
    description: "The font used for the test words.",
    controlType: "select",
    options: [
      { value: "roboto_mono", label: "Roboto Mono" },
      { value: "fira_code", label: "Fira Code" },
      { value: "jetbrains_mono", label: "JetBrains Mono" },
      { value: "source_code_pro", label: "Source Code Pro" },
      { value: "ubuntu_mono", label: "Ubuntu Mono" },
      { value: "inconsolata", label: "Inconsolata" },
    ],
  },
  {
    key: "pageWidth",
    group: "appearance",
    label: "page width",
    description: "Maximum width of the test area.",
    controlType: "buttonGroup",
    options: [
      { value: "100", label: "100%" },
      { value: "125", label: "125%" },
      { value: "150", label: "150%" },
      { value: "200", label: "200%" },
      { value: "max", label: "max" },
    ],
  },
  {
    key: "showAllLines",
    group: "appearance",
    label: "show all lines",
    description: "Show all lines of the test instead of just the current few.",
    controlType: "toggle",
  },
  {
    key: "alwaysShowWordsHistory",
    group: "appearance",
    label: "always show words history",
    description: "Always show previous words above the current line.",
    controlType: "toggle",
  },
  {
    key: "singleListCommandLine",
    group: "appearance",
    label: "single list command line",
    description: "Use a single list layout for the command line.",
    controlType: "buttonGroup",
    options: [
      { value: "off", label: "off" },
      { value: "on", label: "on" },
      { value: "manual", label: "manual" },
    ],
  },

  // ── Theme ──
  {
    key: "colorfulMode",
    group: "theme",
    label: "colorful mode",
    description: "Use multiple colors for the test text based on correctness.",
    controlType: "toggle",
  },

  // ── Hide Elements ──
  {
    key: "capsLockWarning",
    group: "hideElements",
    label: "caps lock warning",
    description: "Show a warning when caps lock is on.",
    controlType: "toggle",
  },
  {
    key: "outOfFocusWarning",
    group: "hideElements",
    label: "out of focus warning",
    description: "Show a warning when the test area loses focus.",
    controlType: "toggle",
  },
];

/** Get all settings for a specific group */
export function getSettingsByGroup(group: SettingGroup): SettingMeta[] {
  return settingsMetadata.filter((s) => s.group === group);
}
