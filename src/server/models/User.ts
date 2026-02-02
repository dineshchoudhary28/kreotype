import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IPersonalBest {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timestamp: Date;
}

export interface IAccount {
  provider: string;
  providerAccountId: string;
}

export interface ITag {
  _id: Types.ObjectId;
  name: string;
  color: string;
}

export interface IPreset {
  _id: Types.ObjectId;
  name: string;
  config: Record<string, unknown>;
}

export interface IEarnedBadge {
  badgeId: string;
  earnedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string | null;
  image: string | null;
  accounts: IAccount[];
  testsStarted: number;
  testsCompleted: number;
  timeTyping: number;
  personalBests: Map<string, IPersonalBest>;
  config: Record<string, unknown> | null;
  friends: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  leaderboardOptOut: boolean;
  streakHourOffset: number | null;
  lastNameChange: Date | null;
  tags: Types.ObjectId[];
  presets: Types.ObjectId[];
  badges: IEarnedBadge[];
  createdAt: Date;
  updatedAt: Date;
}

const personalBestSchema = new Schema<IPersonalBest>(
  {
    wpm: { type: Number, required: true },
    rawWpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    consistency: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  { _id: false }
);

const accountSchema = new Schema<IAccount>(
  {
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
  },
  { _id: false }
);

const earnedBadgeSchema = new Schema<IEarnedBadge>(
  {
    badgeId: { type: String, required: true },
    earnedAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 16,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: { type: String, default: null },
    image: { type: String, default: null },
    accounts: { type: [accountSchema], default: [] },
    testsStarted: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    timeTyping: { type: Number, default: 0 },
    personalBests: { type: Map, of: personalBestSchema, default: new Map() },
    config: { type: Schema.Types.Mixed, default: null },
    friends: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    blockedUsers: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    leaderboardOptOut: { type: Boolean, default: false },
    streakHourOffset: { type: Number, default: null },
    lastNameChange: { type: Date, default: null },
    tags: { type: [Schema.Types.ObjectId], ref: "Tag", default: [] },
    presets: { type: [Schema.Types.ObjectId], ref: "Preset", default: [] },
    badges: { type: [earnedBadgeSchema], default: [] },
  },
  { timestamps: true }
);

// Indexes are already created by `unique: true` on the schema fields

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
