import mongoose, { Schema, type Document } from "mongoose";

interface IRateLimiting {
  enabled: boolean;
}

interface ILeaderboards {
  maxResults: number;
  cacheDurationSeconds: number;
}

interface IDailyLeaderboards {
  enabled: boolean;
  maxResults: number;
  leaderboardExpirationTimeInDays: number;
}

export interface IConfiguration extends Document {
  maintenance: boolean;
  registrationEnabled: boolean;
  maxTestsPerDay: number;
  resultObjectHashEnabled: boolean;
  leaderboards: ILeaderboards;
  rateLimiting: IRateLimiting;
  dailyLeaderboards: IDailyLeaderboards;
  updatedAt: Date;
}

const configurationSchema = new Schema<IConfiguration>({
  maintenance: { type: Boolean, default: false },
  registrationEnabled: { type: Boolean, default: true },
  maxTestsPerDay: { type: Number, default: 0 },
  resultObjectHashEnabled: { type: Boolean, default: false },
  leaderboards: {
    maxResults: { type: Number, default: 100 },
    cacheDurationSeconds: { type: Number, default: 300 },
  },
  rateLimiting: {
    enabled: { type: Boolean, default: true },
  },
  dailyLeaderboards: {
    enabled: { type: Boolean, default: false },
    maxResults: { type: Number, default: 100 },
    leaderboardExpirationTimeInDays: { type: Number, default: 1 },
  },
  updatedAt: { type: Date, default: Date.now },
});

export const Configuration =
  (mongoose.models.Configuration as mongoose.Model<IConfiguration>) ||
  mongoose.model<IConfiguration>("Configuration", configurationSchema);
