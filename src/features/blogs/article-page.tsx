import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LikeButton } from "@/features/blogs/like-button";
import { CommentsSection } from "@/features/blogs/comments-section";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableOfContents } from "@/features/blogs/table-of-contents";
import { MermaidViewer } from "@/features/blogs/mermaid-viewer";
import { BlogEngagement, BlogEngagementCounts } from "./blog-engagement";
import { prepareArticle } from "./prepare-article";
import type { ArticleData } from "./published-post";

export function ArticlePage({ blog, preview = false }: { blog: ArticleData; preview?: boolean }) {
  const { headings, parts } = prepareArticle(blog.content || "");
  const formattedDate = new Date(blog.createdAt)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();

  const content = (
    <div className="blog-content leading-relaxed text-foreground space-y-4">
      {parts.map((part, index) => part.type === "mermaid"
        ? <MermaidViewer key={index} chart={part.data} />
        : <div key={index} className="prose-container" dangerouslySetInnerHTML={{ __html: part.data }} />
      )}
    </div>
  );

  const article = (
    <main className="flex-1 w-full flex flex-col">
      {/* Top Back Navigation Bar */}
      <section className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
          <Link
            href={preview ? "/admin/blogs" : "/"}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {preview ? "Back to blog management" : "Back to blogs"}
          </Link>

          {preview ? (
            <span className="text-xs text-muted-foreground">Private preview</span>
          ) : (
            <BlogEngagementCounts />
          )}
        </div>
      </section>

      {/* Blog Post Header */}
      <header className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x space-y-6">
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
                {blog.coAuthors?.map((ca) => (
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
                      {blog.coAuthors.map((ca, idx) => (
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
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x">
          {headings.length >= 2 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
              <article className="p-6 sm:p-10 lg:dashed-border-r min-w-0">
                {content}
              </article>
              <aside className="hidden lg:block w-[260px] p-5">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                  <TableOfContents headings={headings} />
                </div>
              </aside>
            </div>
          ) : (
            <div className="p-6 sm:p-10">
              <article className="w-full">
                {content}
              </article>
            </div>
          )}
        </div>
      </section>

      {!preview && (
        <section className="w-full flex-1">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x space-y-10">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Enjoyed this article?</h2>
                <p className="text-xs text-muted-foreground">Leave a reaction or join the discussion below.</p>
              </div>
              <LikeButton blogId={blog._id} />
            </div>
            <CommentsSection blogId={blog._id} />
          </div>
        </section>
      )}
    </main>

  );
  if (!preview) return <BlogEngagement key={blog._id} blogId={blog._id}>{article}</BlogEngagement>;

  return (
    <>
      <Navbar />
      {article}
      <Footer />
    </>
  );
}
