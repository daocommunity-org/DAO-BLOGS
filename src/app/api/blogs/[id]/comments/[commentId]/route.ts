import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid IDs provided." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    const isAuthor = comment.userId === session.user.id;
    const isAdmin = userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this comment." },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(commentId);
    await Blog.findByIdAndUpdate(id, { $inc: { commentsCount: -1 } });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[id]/comments/[commentId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}
