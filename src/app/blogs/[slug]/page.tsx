import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Like from "@/models/Like";
import { Navbar } from "@/components/navbar";
import { BlogContentRenderer } from "@/components/blog-content-renderer";
import { LikeButton } from "@/components/like-button";
import { CommentsSection } from "@/components/comments-section";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogData(slug: string) {
  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return null;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = (session?.user as { role?: string } | undefined)?.role;

    if (blog.status === "draft" && userRole !== "admin") {
      return null;
    }

    let hasLiked = false;
    if (session?.user?.id) {
      const existingLike = await Like.findOne({
        blogId: blog._id,
        userId: session.user.id,
      });
      hasLiked = !!existingLike;
    }

    return {
      blog: JSON.parse(JSON.stringify(blog)),
      hasLiked,
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const blog = await Blog.findOne({ slug }).select("title excerpt").lean();

  if (!blog) {
    return { title: "Not Found - DAO Blogs" };
  }

  return {
    title: `${blog.title} - DAO Blogs`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const data = await getBlogData(slug);

  if (!data || !data.blog) {
    notFound();
  }

  const { blog, hasLiked } = data;

  const formattedDate = new Date(blog.createdAt)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Back Navigation Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>{blog.likesCount || 0} likes</span>
              <span>•</span>
              <span>{blog.commentsCount || 0} comments</span>
            </div>
          </div>
        </section>

        {/* Blog Post Header */}
        <header className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                {formattedDate}
              </span>

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 pt-4">
              <Avatar className="w-8 h-8 border border-border/60">
                <AvatarImage src={blog.author?.image} alt={blog.author?.name} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-xs font-medium">
                  {blog.author?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{blog.author?.name}</span>
                <span className="text-xs text-muted-foreground">Author</span>
              </div>
            </div>

            {blog.coverImage && (
              <div className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden border border-border/60 bg-muted/30 mt-6">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </header>

        {/* Article Body Content (Full Bounded Blueprint Width) */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 dashed-border-x">
            <article className="w-full">
              <BlogContentRenderer content={blog.content} />
            </article>
          </div>
        </section>

        {/* Bottom Reactions & Comments Section (Single Like Button) */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-12 dashed-border-x">
            <div className="w-full space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-border/40">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">Enjoyed this article?</h4>
                  <p className="text-xs text-muted-foreground">Leave a reaction or join the discussion below.</p>
                </div>

                <LikeButton
                  blogId={blog._id}
                  initialLikesCount={blog.likesCount || 0}
                  initialHasLiked={hasLiked}
                />
              </div>

              <CommentsSection
                blogId={blog._id}
                initialCommentsCount={blog.commentsCount || 0}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
