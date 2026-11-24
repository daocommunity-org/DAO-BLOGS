import { requireAdminPage } from "@/features/auth/admin-access";
import { Navbar } from "@/components/layout/navbar";
import { BlogEditorForm } from "@/features/admin/blog-editor-form";

export default async function NewBlogPage() {
  const session = await requireAdminPage();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <BlogEditorForm viewerId={session.user.id} />
      </main>
    </div>
  );
}
