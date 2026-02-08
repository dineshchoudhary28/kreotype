import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ITag extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  color?: string; // Hex color for the tag badge
  personalBest?: number; // Optional: track PB with this tag specifically
  active: boolean; // Is it currently selected for the next test? (client-side state mostly, but good to store)
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true
    },
    color: {
      type: String,
      default: null,
      validate: {
        validator: function(v: string | null) {
          return v === null || /^#[0-9a-fA-F]{6}$/.test(v);
        },
        message: 'Color must be a valid hex code (e.g., #FF5733) or null'
      }
    },
    personalBest: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to ensure unique tag names per user
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Tag =
  (mongoose.models.Tag as mongoose.Model<ITag>) ||
  mongoose.model<ITag>("Tag", tagSchema);
