import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import Comment from "@/models/Comment";
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
    const blog = await Blog.findOne(query).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;

    // Only admins can view drafts
    if (blog.status === "draft" && userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view draft" },
        { status: 403 }
      );
    }

    let hasLiked = false;
    if (session?.user?.id) {
      const existingLike = await Like.findOne({
        blogId: blog._id,
        userId: session.user.id,
      });
      hasLiked = !!existingLike;
    }

    return NextResponse.json({ success: true, blog, hasLiked });
  } catch (error: any) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await request.json();

    // Whitelist explicitly allowed fields to prevent mass assignment
    const updateData: Record<string, any> = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.slug !== undefined) updateData.slug = String(body.slug).trim();
    if (body.excerpt !== undefined) updateData.excerpt = String(body.excerpt).trim();
    if (body.coverImage !== undefined) updateData.coverImage = String(body.coverImage).trim();
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags)
        ? body.tags.map((t: string) => String(t).trim().toLowerCase()).filter(Boolean)
        : [];
    }
    if (body.content !== undefined) updateData.content = String(body.content);
    if (body.status !== undefined) {
      updateData.status = body.status === "published" ? "published" : "draft";
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };

    // Check slug uniqueness if slug is being updated
    if (updateData.slug) {
      const slugConflict = await Blog.findOne({
        slug: updateData.slug,
        ...(isObjectId ? { _id: { $ne: id } } : { slug: { $ne: id } }),
      });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: "A blog post with this slug already exists." },
          { status: 400 }
        );
      }
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const blog = await Blog.findOneAndDelete(query);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Cascade delete likes and comments
    await Promise.all([
      Like.deleteMany({ blogId: blog._id }),
      Comment.deleteMany({ blogId: blog._id }),
    ]);

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
}
