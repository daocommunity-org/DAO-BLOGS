"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminBlogActions } from "@/components/admin-blog-actions";
import { Search, Heart, MessageSquare, FileText, Image as ImageIcon } from "lucide-react";

interface AdminBlogsManagerProps {
  blogs: any[];
}

export function AdminBlogsManager({ blogs }: AdminBlogsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.author?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [blogs, searchQuery, statusFilter]);

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;

  return (
    <div className="space-y-8">
      {/* Search & Underline Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/40 pb-px">
        {/* Clean Underline Tabs */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
              statusFilter === "all"
                ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
              statusFilter === "published"
                ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative ${
              statusFilter === "draft"
                ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full pb-2 sm:pb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 sm:-translate-y-[calc(50%+6px)] w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/10 border border-border/50 focus:border-primary/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Blogs Feed (No Card Boxes) */}
      {filteredBlogs.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <FileText className="w-7 h-7 text-muted-foreground/60 mx-auto" />
          <h3 className="text-base font-medium text-foreground">No articles match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No articles found matching "${searchQuery}". Try a different search keyword.`
              : "No articles available in this view."}
          </p>
        </div>
      ) : (
          <div className="divide-y divide-border/20">
          {filteredBlogs.map((b) => (
            <article
              key={b._id}
              className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
            >
              <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                {/* Thumbnail Preview */}
                <div className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden border border-border/40 bg-muted/20 shrink-0 flex items-center justify-center">
                  {b.coverImage ? (
                    <Image
                      src={b.coverImage}
                      alt={b.title}
                      width={112}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${
                        b.status === "published"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/40 text-muted-foreground border-border/40"
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-muted-foreground/50 text-xs">•</span>
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span className="text-muted-foreground/50 text-xs hidden sm:inline">•</span>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      By {b.author?.name}
                      {b.coAuthors && b.coAuthors.length > 0 && (
                        <span className="text-muted-foreground/70">
                          {" "}+{b.coAuthors.length} co-{b.coAuthors.length === 1 ? "author" : "authors"}
                        </span>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                  </h3>

                  {b.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl">
                      {b.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5">
                    <span className="text-[11px] text-muted-foreground/60 font-mono truncate max-w-[180px] sm:max-w-xs">
                      /blogs/{b.slug}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      href={`/admin/blogs/${b._id}/analytics`}
                      className="inline-flex items-center gap-3 text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
                      title="View article analytics"
                    >
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {b.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {b.commentsCount || 0}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Admin Actions (Responsive 2x2 Grid) */}
              <div className="w-full md:w-auto flex md:justify-end shrink-0 pt-2 md:pt-0">
                <AdminBlogActions
                  blogId={b._id}
                  slug={b.slug}
                  title={b.title}
                  status={b.status}
                  authorId={b.author?.id}
                  coAuthors={b.coAuthors}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
