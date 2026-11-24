import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import mongoose from "mongoose";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const blog = await Blog.findOne({ ...query, status: "published" }).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });

    let hasLiked = false;
    if (session?.user?.id) {
      const existingLike = await Like.findOne({
        blogId: blog._id,
        userId: session.user.id,
      });
      hasLiked = !!existingLike;
    }

    const { author, coAuthors } = blog;
    const publicAuthor = ({ id, name, image }: typeof author) => ({ id, name, image });
    return NextResponse.json({
      success: true,
      blog: { ...blog, author: publicAuthor(author), coAuthors: (coAuthors ?? []).map(publicAuthor) },
      hasLiked,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: any) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve blog" },
      { status: 500 }
    );
  }
}

export { PUT, PATCH, DELETE } from "@/app/api/admin/blogs/[id]/route";
