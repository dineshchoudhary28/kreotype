import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IResult extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  testId: string; // <-- Add this
  name: string; // username snapshot at time of result (Monkeytype compat)

  // Core metrics
  wpm: number;
  rawWpm: number;
  accuracy: number; // 0-100
  consistency: number; // 0-100
  keyConsistency: number; // 0-100

  // Test config
  mode: string; // "time" | "words" | "quote" | "zen"
  mode2: number | string;
  difficulty: string; // "normal" | "expert" | "master"
  language: string;
  punctuation: boolean;
  numbers: boolean;
  blindMode: boolean;
  lazyMode: boolean;

  // Timing
  testDuration: number;
  afkDuration: number;

  // Restart tracking (Monkeytype compat)
  restartCount: number;
  incompleteTestSeconds: number;
  bailedOut: boolean;

  // Character stats — Monkeytype uses tuple [correct, incorrect, extra, missed]
  charStats: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  charTotal: number;

  // Chart data (Monkeytype: chartData with wpm/burst/err)
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];

  // Keypress data
  keypressTimings: {
    spacing: number[];
    duration: number[];
    keyOverlap: number;
    startToFirstKey: number;
    lastKeyToEnd: number;
  };
  wpmConsistency: number;

  // Validation
  isValid: boolean;
  invalidReasons: string[];
  isPb: boolean;

  // Tags
  tags: Types.ObjectId[];

  timestamp: Date;
}

const resultSchema = new Schema<IResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: String, required: true },
  name: { type: String, default: "" },

  wpm: { type: Number, required: true, min: 0, max: 500 },
  rawWpm: { type: Number, required: true, min: 0, max: 500 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  consistency: { type: Number, required: true, min: 0, max: 100 },
  keyConsistency: { type: Number, required: true, min: 0, max: 100 },

  mode: { type: String, required: true, enum: ["time", "words", "quote", "zen"] },
  mode2: { type: Schema.Types.Mixed, required: true },
  difficulty: { type: String, default: "normal", enum: ["normal", "expert", "master"] },
  language: { type: String, required: true },
  punctuation: { type: Boolean, default: false },
  numbers: { type: Boolean, default: false },
  blindMode: { type: Boolean, default: false },
  lazyMode: { type: Boolean, default: false },

  testDuration: { type: Number, required: true },
  afkDuration: { type: Number, default: 0 },

  restartCount: { type: Number, default: 0 },
  incompleteTestSeconds: { type: Number, default: 0 },
  bailedOut: { type: Boolean, default: false },

  charStats: {
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    extra: { type: Number, required: true },
    missed: { type: Number, required: true },
  },
  charTotal: { type: Number, default: 0 },

  wpmHistory: { type: [Number], default: [] },
  rawHistory: { type: [Number], default: [] },
  burstHistory: { type: [Number], default: [] },
  errorHistory: { type: [Number], default: [] },

  keypressTimings: {
    spacing: { type: [Number], default: [] },
    duration: { type: [Number], default: [] },
    keyOverlap: { type: Number, default: 0 },
    startToFirstKey: { type: Number, default: 0 },
    lastKeyToEnd: { type: Number, default: 0 },
  },
  wpmConsistency: { type: Number, default: 0 },

  isValid: { type: Boolean, required: true },
  invalidReasons: { type: [String], default: [] },
  isPb: { type: Boolean, default: false },
  tags: { type: [Schema.Types.ObjectId], ref: "Tag", default: [] },
  timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resultSchema.index({ userId: 1, testId: 1 }, { unique: true });
resultSchema.index({ userId: 1, timestamp: -1 });
resultSchema.index({ mode: 1, mode2: 1, timestamp: -1, wpm: -1 });
resultSchema.index({ userId: 1, mode: 1, mode2: 1, wpm: -1 });
resultSchema.index({ tags: 1 });
// Leaderboard optimization - compound index for global rankings
resultSchema.index({ mode: 1, mode2: 1, isValid: 1, wpm: -1 });
// User stats aggregation
resultSchema.index({ userId: 1, isValid: 1, timestamp: -1 });

export const Result =
  (mongoose.models.Result as mongoose.Model<IResult>) ||
  mongoose.model<IResult>("Result", resultSchema);
