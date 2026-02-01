import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IPreset extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  config: {
    mode: string; // "time", "words", "quote", "zen", "custom"
    mode2: string | number; // duration, word count, or quote length
    punctuation: boolean;
    numbers: boolean;
    blindMode: boolean;
    language: string;
    difficulty: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const presetSchema = new Schema<IPreset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { 
      type: String, 
      required: true, 
      maxlength: 32,
      trim: true 
    },
    config: {
      mode: { type: String, required: true },
      mode2: { type: Schema.Types.Mixed, required: true },
      punctuation: { type: Boolean, default: false },
      numbers: { type: Boolean, default: false },
      blindMode: { type: Boolean, default: false },
      language: { type: String, default: "english" },
      difficulty: { type: String, default: "normal" },
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique preset names per user
presetSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Preset =
  (mongoose.models.Preset as mongoose.Model<IPreset>) ||
  mongoose.model<IPreset>("Preset", presetSchema);
