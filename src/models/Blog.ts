import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogAuthor {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
  author: IBlogAuthor;
  coAuthors: IBlogAuthor[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSubSchema = new Schema<IBlogAuthor>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    coverImage: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    author: { type: AuthorSubSchema, required: true },
    coAuthors: { type: [AuthorSubSchema], default: [] },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, createdAt: -1 });
BlogSchema.index({ "author.id": 1, createdAt: -1 });
BlogSchema.index({ "coAuthors.id": 1, createdAt: -1 });
BlogSchema.index({ tags: 1, status: 1, createdAt: -1 });

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
