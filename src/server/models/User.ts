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

export interface IProfileDetails {
  bio: string;
  keyboard: string;
  socialProfiles: Record<string, string>;
}

export interface IInventory {
  badges: string[];
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  image: string | null;
  accounts: IAccount[];
  needsUsername: boolean;
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
  badges: IEarnedBadge[];

  // Gap-analysis fields (Migration 001)
  streak: number;
  maxStreak: number;
  lastResultTimestamp: number | null;
  xp: number;
  profileDetails: IProfileDetails;
  inventory: IInventory;
  banned: boolean;
  verified: boolean;
  lbPersonalBests: Record<string, Record<string, IPersonalBest>>;
  testActivity: Record<string, number>;
  autoBanTimestamps: number[];
  lastReultHashes: string[];

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
    name: {
      type: String,
      default: null,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, default: null },
    image: { type: String, default: null },
    accounts: { type: [accountSchema], default: [] },
    needsUsername: { type: Boolean, default: false },
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
    badges: { type: [earnedBadgeSchema], default: [] },

    // Gap-analysis fields (Migration 001)
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    lastResultTimestamp: { type: Number, default: null },
    xp: { type: Number, default: 0 },
    profileDetails: {
      type: {
        bio: { type: String, default: "" },
        keyboard: { type: String, default: "" },
        socialProfiles: { type: Schema.Types.Mixed, default: {} },
      },
      default: { bio: "", keyboard: "", socialProfiles: {} },
    },
    inventory: {
      type: {
        badges: { type: [String], default: [] },
      },
      default: { badges: [] },
    },
    banned: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    lbPersonalBests: { type: Schema.Types.Mixed, default: { time: {} } },
    testActivity: { type: Schema.Types.Mixed, default: {} },
    autoBanTimestamps: { type: [Number], default: [] },
    lastReultHashes: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Performance indexes for common queries
userSchema.index({ testsCompleted: -1 }); // Leaderboard sorting
userSchema.index({ timeTyping: -1 }); // Time-based leaderboards
userSchema.index({ "badges.badgeId": 1 }); // Badge lookups
userSchema.index({ friends: 1 }); // Friend queries
userSchema.index({ blockedUsers: 1 }); // Block list checks
userSchema.index({ createdAt: -1 }); // Recent users
userSchema.index({ xp: -1 }); // XP leaderboard
userSchema.index({ banned: 1 }); // Ban status lookups

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
