import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminBlogsManager } from "@/components/admin-blogs-manager";
import { Plus, ArrowLeft, FileText, Globe, FileEdit, MessageSquare, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllAdminBlogs() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error("Admin fetch blogs error:", error);
    return [];
  }
}

export default async function AdminBlogsPage() {
  const blogs = await getAllAdminBlogs();

  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b: any) => b.status === "published").length;
  const draftCount = blogs.filter((b: any) => b.status === "draft").length;
  const totalEngagement = blogs.reduce(
    (acc: number, b: any) => acc + (b.likesCount || 0) + (b.commentsCount || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>
          </div>
        </section>

        {/* Header Section */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Blog Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage, publish, and review articles across the community.
              </p>
            </div>

            <Link href="/admin/blogs/new">
              <Button size="sm" className="gap-2 font-medium text-xs cursor-pointer rounded-lg">
                <Plus className="w-4 h-4" />
                Write New Post
              </Button>
            </Link>
          </div>
        </header>

        {/* 4-Column Minimal Stats Row */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-2 md:grid-cols-4">
            <div className="p-6 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Articles
              </span>
              <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                {totalCount}
              </div>
            </div>

            <div className="p-6 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Published
              </span>
              <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                {publishedCount}
              </div>
            </div>

            <div className="p-6 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Drafts
              </span>
              <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                {draftCount}
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Engagement
              </span>
              <div className="text-2xl sm:text-3xl font-semibold text-foreground">
                {totalEngagement}
              </div>
            </div>
          </div>
        </section>

        {/* Management Table / Feed */}
        <section className="w-full flex-1 flex flex-col">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x flex-1">
            <AdminBlogsManager blogs={blogs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
