import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const all = searchParams.get("all") === "true";

    const filter: Record<string, any> = {};

    if (!all) {
      filter.status = "published";
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .select("-content")
      .lean();

    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { title, slug, excerpt, coverImage, tags, content, status } = body;

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
    });

    return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}
