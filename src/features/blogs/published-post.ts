import "server-only";

import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Blog, { type IBlog, type IBlogAuthor } from "@/models/Blog";

export type ArticleData = Pick<IBlog, "title" | "slug" | "excerpt" | "coverImage" | "tags" | "content" | "createdAt"> & {
  _id: string;
  author: Omit<IBlogAuthor, "email">;
  coAuthors: Omit<IBlogAuthor, "email">[];
};

export const articleFields = "title slug excerpt coverImage tags content createdAt author.id author.name author.image coAuthors.id coAuthors.name coAuthors.image";

export const getPublishedPost = cache(async (slug: string) => {
  await connectToDatabase();
  return Blog.findOne({ slug, status: "published" }).select(articleFields).lean();
});
