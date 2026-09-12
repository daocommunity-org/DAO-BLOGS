import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { BlogAnalyticsView } from "@/components/blog-analytics-view";
import { ArrowLeft, ExternalLink, BarChart3, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface BlogAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogAnalyticsPage({ params }: BlogAnalyticsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || userRole !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectToDatabase();
  const blog = await Blog.findById(id).lean();

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Article Analytics
            </span>
          </div>
        </section>

        {/* Header Section */}
        <header className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${
                    blog.status === "published"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/40 text-muted-foreground border-border/40"
                  }`}
                >
                  {blog.status}
                </span>
                <span className="text-muted-foreground/40 text-xs">•</span>
                <time className="text-[11px] text-muted-foreground">
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground line-clamp-2">
                {blog.title}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                /blogs/{blog.slug}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href={`/blogs/${blog.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/40 hover:border-border transition-colors"
              >
                <span>View Live</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <Link
                href={`/admin/blogs/${id}/edit`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/30 transition-colors"
              >
                Edit Post
              </Link>
            </div>
          </div>
        </header>

        {/* Blog Analytics Feed Container */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x">
            <BlogAnalyticsView
              blogId={id}
              blogTitle={blog.title}
              slug={blog.slug}
              initialLikesCount={blog.likesCount || 0}
              initialCommentsCount={blog.commentsCount || 0}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
