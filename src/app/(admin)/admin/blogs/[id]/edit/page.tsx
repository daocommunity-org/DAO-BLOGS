import { requireAdminPage } from "@/features/auth/admin-access";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { Navbar } from "@/components/layout/navbar";
import { BlogEditorForm } from "@/features/admin/blog-editor-form";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

async function getBlogForEdit(id: string) {
  await connectToDatabase();
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { slug: id }] }
    : { slug: id };
  return Blog.findOne(query).lean();
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await requireAdminPage();

  const { id } = await params;
  const blog = await getBlogForEdit(id);

  if (!blog) {
    notFound();
  }

  // Permission enforcement: must be primary author or designated co-author
  const isPrimaryAuthor = blog.author?.id === session.user.id;
  const isCoAuthor = blog.coAuthors?.some((author) => author.id === session.user.id);

  if (!isPrimaryAuthor && !isCoAuthor) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <BlogEditorForm
          key={String(blog._id)}
          viewerId={session.user.id}
          canManageAuthors={isPrimaryAuthor}
          initialData={{
            _id: String(blog._id),
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage ?? "",
            tags: blog.tags ?? [],
            content: blog.content,
            status: blog.status,
            authorName: blog.author?.name,
            coAuthors: (blog.coAuthors ?? []).map(({ id, name, email }) => ({ id, name, email })),
          }}
        />
      </main>
    </div>
  );
}
