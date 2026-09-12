"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageSquare, FileText } from "lucide-react";

interface ProfileActivityTabsProps {
  isAdmin: boolean;
  authoredBlogs: any[];
  likedBlogs: any[];
  comments: any[];
}

export function ProfileActivityTabs({
  isAdmin,
  authoredBlogs,
  likedBlogs,
  comments,
}: ProfileActivityTabsProps) {
  const [activeTab, setActiveTab] = useState<"articles" | "likes" | "comments">(
    isAdmin ? "articles" : "likes"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="w-full dashed-border-b">
      <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x space-y-8">
        {/* Clean Underline Tab Navigation - No Boxes */}
        <div className="flex items-center justify-between border-b border-border/40 pb-px">
          <div className="flex items-center gap-8">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("articles")}
                className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
                  activeTab === "articles"
                    ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Authored ({authoredBlogs.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("likes")}
              className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === "likes"
                  ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Liked Articles ({likedBlogs.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === "comments"
                  ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {isAdmin && activeTab === "articles" && (
            <Link
              href="/admin/blogs/new"
              className="text-xs text-primary hover:underline font-medium hidden sm:inline-flex items-center gap-1"
            >
              + Write New Article
            </Link>
          )}
        </div>

        {/* Tab 1: Authored Articles (Admin Only) */}
        {isAdmin && activeTab === "articles" && (
          <div>
            {authoredBlogs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-base font-medium text-foreground">No articles authored yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Create your first article using the markdown and Mermaid editor.
                </p>
                <div className="pt-4">
                  <Link
                    href="/admin/blogs/new"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Write an article →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {authoredBlogs.map((b) => (
                  <article
                    key={b._id}
                    className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            b.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-[11px]">
                          {formatDate(b.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                      </h3>

                      {b.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {b.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-muted-foreground/80" />
                          {b.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/80" />
                          {b.commentsCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <Link
                        href={`/blogs/${b.slug}`}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/blogs/${b._id}/edit`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Liked Articles */}
        {activeTab === "likes" && (
          <div>
            {likedBlogs.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-base font-medium text-foreground">No liked articles yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Explore the community feed and like articles to bookmark your favorite reads.
                </p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Explore articles →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {likedBlogs.map((like) => {
                  const blog = like.blogId;
                  return (
                    <article
                      key={like._id}
                      className="py-6 first:pt-0 last:pb-0 group"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                              {blog.author?.name || "Author"}
                            </span>
                            <span>•</span>
                            <span>Liked on {formatDate(like.createdAt)}</span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                            <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                          </h3>

                          {blog.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {blog.excerpt}
                            </p>
                          )}

                          <div className="pt-1">
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              Read article →
                            </Link>
                          </div>
                        </div>

                        {blog.coverImage ? (
                          <Link href={`/blogs/${blog.slug}`} className="shrink-0 self-start sm:self-center">
                            <Image
                              src={blog.coverImage}
                              alt={blog.title}
                              width={144}
                              height={96}
                              className="w-28 h-20 sm:w-36 sm:h-24 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                            />
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Comments */}
        {activeTab === "comments" && (
          <div>
            {comments.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-base font-medium text-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Join discussions and share your perspective on community articles.
                </p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Browse articles →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {comments.map((comment) => {
                  const blog = comment.blogId;
                  return (
                    <div
                      key={comment._id}
                      className="py-6 first:pt-0 last:pb-0 space-y-3 group"
                    >
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground truncate">
                          <span>Commented on</span>
                          <Link
                            href={`/blogs/${blog.slug}`}
                            className="font-medium text-foreground hover:text-primary transition-colors truncate"
                          >
                            {blog.title}
                          </Link>
                        </div>

                        <span className="text-muted-foreground text-[11px] shrink-0">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {/* Editorial quote bar - clean and box-free */}
                      <p className="text-sm text-foreground/90 leading-relaxed pl-4 border-l-2 border-primary/50">
                        {comment.content}
                      </p>

                      <div>
                        <Link
                          href={`/blogs/${blog.slug}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          View discussion in article →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
