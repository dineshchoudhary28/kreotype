import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IApeKey extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  keyHash: string;
  active: boolean;
  lastUsed: Date | null;
  createdAt: Date;
}

const apeKeySchema = new Schema<IApeKey>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  keyHash: { type: String, required: true },
  active: { type: Boolean, default: true },
  lastUsed: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

apeKeySchema.index({ userId: 1 });

export const ApeKey =
  (mongoose.models.ApeKey as mongoose.Model<IApeKey>) ||
  mongoose.model<IApeKey>("ApeKey", apeKeySchema);
