import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import mongoose from "mongoose";

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
        { success: false, error: "Authentication required to like posts." },
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

    await connectToDatabase();
    const blogId = new mongoose.Types.ObjectId(id);
    const userId = session.user.id;

    const existingLike = await Like.findOne({ blogId, userId });

    if (existingLike) {
      // Unlike
      const res = await Like.deleteOne({ _id: existingLike._id });
      if (res.deletedCount > 0) {
        await Blog.findByIdAndUpdate(blogId, {
          $inc: { likesCount: -1 },
        });
      }
      const currentBlog = await Blog.findById(blogId).select("likesCount").lean();
      const safeCount = Math.max(0, currentBlog?.likesCount ?? 0);
      if ((currentBlog?.likesCount ?? 0) < 0) {
        await Blog.findByIdAndUpdate(blogId, { $set: { likesCount: 0 } });
      }

      return NextResponse.json({
        success: true,
        liked: false,
        likesCount: safeCount,
      });
    } else {
      // Like
      try {
        await Like.create({ blogId, userId });
        const updated = await Blog.findByIdAndUpdate(
          blogId,
          { $inc: { likesCount: 1 } },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          liked: true,
          likesCount: Math.max(0, updated?.likesCount ?? 1),
        });
      } catch (createErr: any) {
        // If code 11000 (duplicate key from concurrent request), user is already liked
        if (createErr.code === 11000) {
          const currentBlog = await Blog.findById(blogId).select("likesCount").lean();
          return NextResponse.json({
            success: true,
            liked: true,
            likesCount: Math.max(0, currentBlog?.likesCount ?? 1),
          });
        }
        throw createErr;
      }
    }
  } catch (error: any) {
    console.error("POST /api/blogs/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  }
}
