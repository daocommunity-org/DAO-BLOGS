import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import mongoose from "mongoose";
import { BlogContentEditor } from "@/components/blog-content-editor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

async function getBlogForEditor(id: string) {
  try {
    await connectToDatabase();
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const blog = await Blog.findOne({
      $or: [{ _id: isObjectId ? id : null }, { slug: id }],
    })
      .select("_id title slug status content author coAuthors")
      .lean();
    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error("Error fetching blog for editor:", error);
    return null;
  }
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/?error=unauthorized");
  }

  const { id } = await params;
  const blog = await getBlogForEditor(id);

  if (!blog) {
    notFound();
  }

  const isPrimaryAuthor = blog.author?.id === session.user.id;
  const isCoAuthor = blog.coAuthors?.some((ca: any) => ca.id === session.user.id);

  if (!isPrimaryAuthor && !isCoAuthor) {
    redirect("/admin/blogs?error=not_author");
  }

  return (
    <BlogContentEditor
      blogId={blog._id}
      slug={blog.slug}
      title={blog.title}
      status={blog.status}
      initialContent={blog.content || ""}
    />
  );
}
