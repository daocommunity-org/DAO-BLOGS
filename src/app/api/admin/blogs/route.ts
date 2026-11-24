import { NextRequest, NextResponse } from "next/server";
import { adminNotFound, getAdminSession } from "@/features/auth/admin-access";
import { revalidatePublishedPost } from "@/features/blogs/revalidate-published-post";
import { connectToDatabase } from "@/lib/mongodb";
import client from "@/lib/mongodb-client";
import Blog from "@/models/Blog";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return adminNotFound();

    await connectToDatabase();
    const body = await request.json();
    const { title, slug, excerpt, coverImage, tags, content, status, coAuthors } = body;

    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { success: false, error: "Title, slug, excerpt, and content are required." },
        { status: 400 }
      );
    }

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { success: false, error: "A blog post with this slug already exists." },
        { status: 400 }
      );
    }

    // Sanitize and hydrate coAuthors list from user collection, excluding primary author
    const rawCoAuthorList = Array.isArray(coAuthors)
      ? coAuthors.filter((ca: any) => ca && ca.id && ca.id !== session.user.id)
      : [];

    const rawIds = rawCoAuthorList.map((ca: any) => String(ca.id));
    const objectIds = rawIds
      .filter((cid: string) => mongoose.Types.ObjectId.isValid(cid))
      .map((cid: string) => new mongoose.Types.ObjectId(cid));

    const usersDb = await client
      .db()
      .collection("user")
      .find({ _id: { $in: objectIds } })
      .project({ _id: 1, name: 1, email: 1, image: 1 })
      .toArray();

    const userMap = new Map(usersDb.map((u) => [u._id.toString(), u]));

    const sanitizedCoAuthors = rawCoAuthorList.map((ca: any) => {
      const u = userMap.get(String(ca.id));
      return {
        id: String(ca.id),
        name: String(u?.name || ca.name || "Co-Author"),
        email: String(u?.email || ca.email || ""),
        image: String(u?.image || ca.image || ""),
      };
    });

    const newBlog = await Blog.create({
      title,
      slug,
      excerpt,
      coverImage: coverImage || "",
      tags: Array.isArray(tags) ? tags : [],
      content,
      status: status === "published" ? "published" : "draft",
      author: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || "",
      },
      coAuthors: sanitizedCoAuthors,
    });

    revalidatePublishedPost(undefined, newBlog);
    return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}
