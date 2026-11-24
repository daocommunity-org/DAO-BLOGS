import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getViewerSession, hasAdminPermission } from "@/features/auth/admin-access";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";

const responseHeaders = { "Cache-Control": "private, no-store" };

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: responseHeaders });
  }

  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ _id: id, status: "published" })
      .select("likesCount commentsCount").lean();
    if (!blog) {
      return NextResponse.json({ error: "Not found." }, { status: 404, headers: responseHeaders });
    }

    const session = await getViewerSession();
    const userId = session?.user.id;
    const liked = userId ? await Like.exists({ blogId: blog._id, userId }) : null;

    return NextResponse.json({
      likesCount: blog.likesCount ?? 0,
      commentsCount: blog.commentsCount ?? 0,
      hasLiked: !!liked,
      canModerate: !!session && await hasAdminPermission(session.user.id),
    }, { headers: responseHeaders });
  } catch (error) {
    console.error("Loading blog engagement failed:", error);
    return NextResponse.json({ error: "Could not load engagement." }, { status: 500, headers: responseHeaders });
  }
}
