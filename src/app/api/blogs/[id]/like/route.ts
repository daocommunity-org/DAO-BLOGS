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
      await Like.deleteOne({ _id: existingLike._id });
      const updated = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      return NextResponse.json({
        success: true,
        liked: false,
        likesCount: Math.max(0, updated?.likesCount ?? 0),
      });
    } else {
      // Like
      await Like.create({ blogId, userId });
      const updated = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );
      return NextResponse.json({
        success: true,
        liked: true,
        likesCount: updated?.likesCount ?? 1,
      });
    }
  } catch (error: any) {
    console.error("POST /api/blogs/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  }
}
