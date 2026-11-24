import { getViewerSession, hasAdminPermission } from "@/features/auth/admin-access";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getViewerSession();

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
    const blogObjectId = new mongoose.Types.ObjectId(id);
    const commentObjectId = new mongoose.Types.ObjectId(commentId);

    if (!(await Blog.exists({ _id: blogObjectId, status: "published" }))) {
      return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
    }

    const comment = await Comment.findOne({
      _id: commentObjectId,
      blogId: blogObjectId,
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found on this blog." },
        { status: 404 }
      );
    }

    const isAuthor = comment.userId === session.user.id;

    if (!isAuthor && !(await hasAdminPermission(session.user.id))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this comment." },
        { status: 403 }
      );
    }

    const { deletedCount } = await Comment.deleteOne({ _id: commentObjectId, blogId: blogObjectId });
    const blog = deletedCount
      ? await Blog.findOneAndUpdate(
        { _id: blogObjectId, commentsCount: { $gt: 0 } },
        { $inc: { commentsCount: -1 } },
        { new: true, projection: { commentsCount: 1 } },
      )
      : await Blog.findById(blogObjectId).select("commentsCount").lean();

    return NextResponse.json({
      success: true,
      commentsCount: blog?.commentsCount ?? 0,
      message: "Comment deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/blogs/[id]/comments/[commentId] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
