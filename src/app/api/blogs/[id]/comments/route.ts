import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid blog ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const blogId = new mongoose.Types.ObjectId(id);

    const comments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error("GET /api/blogs/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to post comments." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid blog ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rawContent = body?.content?.trim();

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: "Comment content cannot be empty." },
        { status: 400 }
      );
    }

    if (rawContent.length > 1500) {
      return NextResponse.json(
        { success: false, error: "Comment cannot exceed 1,500 characters." },
        { status: 400 }
      );
    }

    const DOMPurify = (await import("isomorphic-dompurify")).default;
    const content = DOMPurify.sanitize(rawContent, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Invalid comment content." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const blogId = new mongoose.Types.ObjectId(id);

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (blog.status === "draft" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot comment on an unpublished blog post." },
        { status: 403 }
      );
    }

    const newComment = await Comment.create({
      blogId,
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image || "",
      content,
    });

    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

    return NextResponse.json(
      { success: true, comment: newComment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/blogs/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
