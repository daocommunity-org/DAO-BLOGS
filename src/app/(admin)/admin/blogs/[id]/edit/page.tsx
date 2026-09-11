import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { Navbar } from "@/components/navbar";
import { BlogEditorForm } from "@/components/blog-editor-form";
import mongoose from "mongoose";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

async function getBlogForEdit(id: string) {
  try {
    await connectToDatabase();
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const blog = await Blog.findOne({
      $or: [{ _id: isObjectId ? id : null }, { slug: id }],
    }).lean();

    if (!blog) return null;
    return JSON.parse(JSON.stringify(blog));
  } catch (error) {
    console.error("Error fetching blog for edit:", error);
    return null;
  }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blog = await getBlogForEdit(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <BlogEditorForm initialData={blog} isEdit={true} />
      </main>
    </div>
  );
}
