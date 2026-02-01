import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IFriendRequest extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

friendRequestSchema.index({ to: 1, status: 1 });
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export const FriendRequest =
  (mongoose.models.FriendRequest as mongoose.Model<IFriendRequest>) ||
  mongoose.model<IFriendRequest>("FriendRequest", friendRequestSchema);
