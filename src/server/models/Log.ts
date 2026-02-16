import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ILog extends Document {
  _id: Types.ObjectId;
  type: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  userId: Types.ObjectId | null;
  important: boolean;
  timestamp: Date;
}

const logSchema = new Schema<ILog>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  important: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

logSchema.index({ timestamp: -1 });
logSchema.index({ type: 1, timestamp: -1 });

export const Log =
  (mongoose.models.Log as mongoose.Model<ILog>) ||
  mongoose.model<ILog>("Log", logSchema);
