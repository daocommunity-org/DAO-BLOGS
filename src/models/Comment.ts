import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  blogId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: "" },
    content: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

CommentSchema.index({ blogId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
