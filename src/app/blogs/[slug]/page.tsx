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
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { extractHeadingsAndInjectIds } from "@/lib/toc";
import { TableOfContents } from "@/components/table-of-contents";

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
  const blog = await Blog.findOne({ slug }).select("title excerpt status").lean();

  if (!blog) {
    return { title: "Not Found - DAO Blogs" };
  }

  if (blog.status === "draft") {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole !== "admin") {
      return { title: "Not Found - DAO Blogs" };
    }
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
  const { headings, modifiedHtml } = extractHeadingsAndInjectIds(blog.content || "");

  const formattedDate = new Date(blog.createdAt)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
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

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
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

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Authors & Co-Authors Presentation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-3">
                {/* Stacked Avatars */}
                <div className="flex -space-x-2.5 overflow-hidden p-0.5">
                  <Avatar className="inline-block w-9 h-9 ring-2 ring-background shrink-0">
                    <AvatarImage src={blog.author?.image} alt={blog.author?.name} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                      {blog.author?.name?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {blog.coAuthors?.map((ca: any) => (
                    <Avatar key={ca.id} className="inline-block w-9 h-9 ring-2 ring-background shrink-0">
                      <AvatarImage src={ca.image} alt={ca.name} referrerPolicy="no-referrer" />
                      <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                        {ca.name?.[0]?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                {/* Combined Author Byline */}
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">
                    <span>{blog.author?.name}</span>
                    {blog.coAuthors && blog.coAuthors.length > 0 && (
                      <span className="text-muted-foreground font-normal">
                        {" "}with{" "}
                        {blog.coAuthors.map((ca: any, idx: number) => (
                          <span key={ca.id} className="text-foreground font-medium">
                            {ca.name}
                            {idx < (blog.coAuthors?.length || 0) - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {blog.coverImage && (
              <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden border border-border/60 bg-muted/30 mt-6">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </header>

        {/* Article Body Content with Sidebar TOC */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto dashed-border-x">
            {headings.length >= 2 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <article className="p-6 sm:p-10 lg:dashed-border-r lg:col-span-8">
                  <BlogContentRenderer content={modifiedHtml} />
                </article>
                <aside className="hidden lg:block lg:col-span-4 p-6 sm:p-8">
                  <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
                    <TableOfContents headings={headings} />
                  </div>
                </aside>
              </div>
            ) : (
              <div className="p-6 sm:p-10">
                <article className="w-full">
                  <BlogContentRenderer content={modifiedHtml} />
                </article>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Reactions & Comments Section */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x">
            <div className="w-full space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-foreground">Enjoyed this article?</h4>
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
