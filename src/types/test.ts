export enum CharState {
  Correct = "correct",
  Incorrect = "incorrect",
  Extra = "extra",
  Missed = "missed",
  Untyped = "untyped",
}

export interface WordState {
  word: string;
  input: string;
  charStates: CharState[];
}

export interface KeypressTimings {
  spacing: number[];
  duration: number[];
  keyOverlap: number;
  startToFirstKey: number;
  lastKeyToEnd: number;
}

export interface CharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  keyConsistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  correctSpaces: number;
  time: number;
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];
  keypressTimings: KeypressTimings;
  charStats: CharStats;
  afkDuration: number;
  validation?: TestValidation;
  isPb?: boolean;
}

export type TestMode = "time" | "words" | "quote" | "zen";

export interface TestValidation {
  isValid: boolean;
  invalidReasons: string[];
}

export interface CompletedEvent {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  keyConsistency: number;
  mode: TestMode;
  mode2: number | string;
  timestamp: number;
  testDuration: number;
  afkDuration: number;
  charStats: CharStats;
  keypressTimings: KeypressTimings;
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];
  language: string;
  difficulty: string;
  punctuation: boolean;
  numbers: boolean;
  blindMode: boolean;
  validation: TestValidation;
}

export interface QuoteData {
  text: string;
  source: string;
  id: number;
  length: number;
  group: "short" | "medium" | "long" | "thicc";
}
