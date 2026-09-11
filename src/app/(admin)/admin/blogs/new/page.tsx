import { Navbar } from "@/components/navbar";
import { BlogEditorForm } from "@/components/blog-editor-form";

export default function NewBlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <BlogEditorForm />
      </main>
    </div>
  );
}
