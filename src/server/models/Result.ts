import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IResult extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  keyConsistency: number;
  mode: string;
  mode2: number | string;
  testDuration: number;
  afkDuration: number;
  language: string;
  difficulty: string;
  punctuation: boolean;
  numbers: boolean;
  blindMode: boolean;
  charStats: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];
  keypressTimings: {
    spacing: number[];
    duration: number[];
    keyOverlap: number;
    startToFirstKey: number;
    lastKeyToEnd: number;
  };
  isValid: boolean;
  invalidReasons: string[];
  isPb: boolean;
  tags: Types.ObjectId[];
  timestamp: Date;
}

const resultSchema = new Schema<IResult>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  wpm: { type: Number, required: true },
  rawWpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  consistency: { type: Number, required: true },
  keyConsistency: { type: Number, required: true },
  mode: { type: String, required: true },
  mode2: { type: Schema.Types.Mixed, required: true },
  testDuration: { type: Number, required: true },
  afkDuration: { type: Number, required: true },
  language: { type: String, required: true },
  difficulty: { type: String, required: true },
  punctuation: { type: Boolean, required: true },
  numbers: { type: Boolean, required: true },
  blindMode: { type: Boolean, required: true },
  charStats: {
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    extra: { type: Number, required: true },
    missed: { type: Number, required: true },
  },
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
  isValid: { type: Boolean, required: true },
  invalidReasons: { type: [String], default: [] },
  isPb: { type: Boolean, default: false },
  tags: { type: [Schema.Types.ObjectId], ref: "Tag", default: [] },
  timestamp: { type: Date, default: Date.now },
});

resultSchema.index({ userId: 1, timestamp: -1 });
resultSchema.index({ mode: 1, mode2: 1, wpm: -1, isValid: 1 });
resultSchema.index({ mode: 1, mode2: 1, timestamp: -1, wpm: -1 });
resultSchema.index({ userId: 1, mode: 1, mode2: 1, wpm: -1 });
resultSchema.index({ tags: 1 }); // Index for tag filtering

export const Result =
  (mongoose.models.Result as mongoose.Model<IResult>) ||
  mongoose.model<IResult>("Result", resultSchema);
