import { NextRequest, NextResponse } from "next/server";
import { adminNotFound } from "@/features/auth/admin-access";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const requestedAll = searchParams.get("all") === "true";

    if (requestedAll) return adminNotFound();
    await connectToDatabase();

    const filter: Record<string, unknown> = { status: "published" };

    if (tag) {
      filter.tags = tag.trim().toLowerCase();
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { excerpt: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .select("title slug excerpt coverImage tags status author.id author.name author.image coAuthors.id coAuthors.name coAuthors.image createdAt updatedAt likesCount commentsCount")
      .lean();

    return NextResponse.json({ success: true, blogs }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    console.error("GET /api/blogs error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch blogs";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export { POST } from "@/app/api/admin/blogs/route";
