import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { requireAdminPage } from "@/features/auth/admin-access";
import { ArticlePage } from "@/features/blogs/article-page";
import { articleFields } from "@/features/blogs/published-post";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Article preview - DAO Blogs",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: PageProps<"/admin/blogs/[id]/preview">) {
  await requireAdminPage();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectToDatabase();
  const blog = await Blog.findById(id).select(articleFields).lean();
  if (!blog) notFound();
  return <ArticlePage blog={{ ...blog, _id: String(blog._id) }} preview />;
}
