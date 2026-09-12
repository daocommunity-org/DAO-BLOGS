import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import client from "@/lib/mongodb-client";
import {
  extractAllCloudinaryUrls,
  deleteOrphanedCloudinaryImages,
} from "@/lib/cloudinary";

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

    // Fetch existing blog first to check permissions and track images
    const existingBlog = await Blog.findOne(query);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Co-author permission check: must be primary author or listed as a co-author
    const isPrimaryAuthor = existingBlog.author?.id === session.user.id;
    const isCoAuthor = existingBlog.coAuthors?.some((ca: any) => ca.id === session.user.id);
    if (!isPrimaryAuthor && !isCoAuthor) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. You are not an author or co-author of this article." },
        { status: 403 }
      );
    }

    // Only the primary author can modify co-authors
    if (body.coAuthors !== undefined) {
      if (!isPrimaryAuthor) {
        return NextResponse.json(
          { success: false, error: "Only the primary author can add or modify co-authors." },
          { status: 403 }
        );
      }

      const rawList = Array.isArray(body.coAuthors)
        ? body.coAuthors.filter((ca: any) => ca && ca.id && ca.id !== existingBlog.author?.id)
        : [];

      const rawIds = rawList.map((ca: any) => String(ca.id));
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

      updateData.coAuthors = rawList.map((ca: any) => {
        const u = userMap.get(String(ca.id));
        return {
          id: String(ca.id),
          name: String(u?.name || ca.name || "Co-Author"),
          email: String(u?.email || ca.email || ""),
          image: String(u?.image || ca.image || ""),
        };
      });
    }

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

    const oldImageUrls = extractAllCloudinaryUrls(existingBlog.content, existingBlog.coverImage);

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

    // Clean up any images that were removed or replaced
    const newImageUrls = extractAllCloudinaryUrls(updatedBlog.content, updatedBlog.coverImage);
    deleteOrphanedCloudinaryImages(oldImageUrls, newImageUrls).catch((err) =>
      console.error("Orphaned Cloudinary images cleanup failed:", err)
    );

    revalidatePath(`/admin/blogs/${id}/edit`);
    revalidatePath("/admin/blogs");
    revalidatePath(`/blogs/${updatedBlog.slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error: any) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

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
    
    const existingBlog = await Blog.findOne(query);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Only the primary author who created the blog can delete it
    if (existingBlog.author?.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied. Only the primary author can delete this article.",
        },
        { status: 403 }
      );
    }

    const blog = await Blog.findOneAndDelete(query);
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Automatically clean up all Cloudinary images associated with this post
    const imagesToDelete = extractAllCloudinaryUrls(blog.content, blog.coverImage);
    if (imagesToDelete.length > 0) {
      deleteOrphanedCloudinaryImages(imagesToDelete, []).catch((err) =>
        console.error("Cloudinary image deletion failed for blog", blog._id, err)
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
