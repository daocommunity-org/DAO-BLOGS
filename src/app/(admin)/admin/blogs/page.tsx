import { requireAdminPage } from "@/features/auth/admin-access";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminBlogsManager, type AdminBlogListItem } from "@/features/admin/admin-blogs-manager";
import { Plus, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllAdminBlogs(viewerId: string): Promise<AdminBlogListItem[]> {
  await connectToDatabase();
  const posts = await Blog.find({})
    .sort({ createdAt: -1 })
    .select("slug title excerpt coverImage status author.id author.name coAuthors.id createdAt likesCount commentsCount")
    .lean();

  return posts.map((post) => {
    const canDelete = post.author?.id === viewerId;
    const coAuthors = post.coAuthors ?? [];
    return {
      id: String(post._id),
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      authorName: post.author?.name,
      coAuthorCount: coAuthors.length,
      createdAt: post.createdAt?.toISOString(),
      likesCount: post.likesCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
      canEdit: canDelete || coAuthors.some((author) => author.id === viewerId),
      canDelete,
    };
  });
}

export default async function AdminBlogsPage() {
  const session = await requireAdminPage();
  const blogs = await getAllAdminBlogs(session.user.id);

  const totalCount = blogs.length;
  const publishedCount = blogs.filter((post) => post.status === "published").length;
  const draftCount = totalCount - publishedCount;
  const totalEngagement = blogs.reduce((sum, post) => sum + post.likesCount + post.commentsCount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-slate-300 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
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

            <Link href="/admin/blogs/new" className={buttonVariants({ size: "lg", className: "h-10 gap-2 px-4 font-semibold" })}>
              <Plus aria-hidden="true" className="size-4" />
              Write new post
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
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {totalCount}
              </div>
            </div>

            <div className="p-6 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Published
              </span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {publishedCount}
              </div>
            </div>

            <div className="p-6 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Drafts
              </span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {draftCount}
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Engagement
              </span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
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
