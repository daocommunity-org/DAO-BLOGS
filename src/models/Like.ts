import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILike extends Document {
  blogId: mongoose.Types.ObjectId;
  userId: string;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ userId: 1, createdAt: -1 });

export const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;
