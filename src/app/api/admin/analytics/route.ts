import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import client from "@/lib/mongodb-client";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "likes"; // "likes" | "comments"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const blogId = searchParams.get("blogId");
    const query = searchParams.get("query")?.trim() || "";

    await connectToDatabase();
    const db = client.db();

    // Summary counts
    const [totalLikes, totalComments, totalBlogs] = await Promise.all([
      Like.countDocuments({}),
      Comment.countDocuments({}),
      Blog.countDocuments({}),
    ]);

    // Active blogs for dropdown filter
    const activeBlogs = await Blog.find({})
      .select("_id title slug")
      .sort({ createdAt: -1 })
      .lean();

    const skip = (page - 1) * limit;

    if (tab === "likes") {
      // Build filter
      const filter: any = {};
      if (blogId && mongoose.Types.ObjectId.isValid(blogId)) {
        filter.blogId = new mongoose.Types.ObjectId(blogId);
      }

      // If user search query is provided, find matching users first
      if (query) {
        const userMatches = await db
          .collection("user")
          .find({
            $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          })
          .project({ _id: 1 })
          .toArray();

        const matchingUserIds = userMatches.map((u) => u._id.toString());
        filter.userId = { $in: matchingUserIds };
      }

      const totalItems = await Like.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit) || 1;

      const rawLikes = await Like.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "blogId", select: "title slug coverImage" })
        .lean();

      // Collect distinct user IDs to fetch user profiles
      const userIds = Array.from(new Set(rawLikes.map((l: any) => l.userId))).filter(Boolean);
      const objectIds = userIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      const users = await db
        .collection("user")
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1, name: 1, email: 1, image: 1 })
        .toArray();

      const userMap = new Map<string, any>();
      users.forEach((u) => {
        userMap.set(u._id.toString(), u);
      });

      const items = rawLikes.map((l: any) => {
        const u = userMap.get(l.userId);
        return {
          id: l._id.toString(),
          createdAt: l.createdAt,
          user: {
            id: l.userId,
            name: u?.name || "Community Member",
            email: u?.email || "",
            image: u?.image || "",
          },
          blog: l.blogId
            ? {
                id: l.blogId._id?.toString(),
                title: l.blogId.title,
                slug: l.blogId.slug,
                coverImage: l.blogId.coverImage,
              }
            : null,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
          summary: {
            totalLikes,
            totalComments,
            totalBlogs,
          },
          activeBlogs: activeBlogs.map((b: any) => ({
            id: b._id.toString(),
            title: b.title,
            slug: b.slug,
          })),
        },
      });
    } else {
      // Tab === "comments"
      const filter: any = {};
      if (blogId && mongoose.Types.ObjectId.isValid(blogId)) {
        filter.blogId = new mongoose.Types.ObjectId(blogId);
      }

      if (query) {
        filter.$or = [
          { userName: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ];
      }

      const totalItems = await Comment.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit) || 1;

      const rawComments = await Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "blogId", select: "title slug coverImage" })
        .lean();

      const items = rawComments.map((c: any) => ({
        id: c._id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.userId,
          name: c.userName || "Community Member",
          image: c.userImage || "",
        },
        blog: c.blogId
          ? {
              id: c.blogId._id?.toString(),
              title: c.blogId.title,
              slug: c.blogId.slug,
              coverImage: c.blogId.coverImage,
            }
          : null,
      }));

      return NextResponse.json({
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
          summary: {
            totalLikes,
            totalComments,
            totalBlogs,
          },
          activeBlogs: activeBlogs.map((b: any) => ({
            id: b._id.toString(),
            title: b.title,
            slug: b.slug,
          })),
        },
      });
    }
  } catch (error: any) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
