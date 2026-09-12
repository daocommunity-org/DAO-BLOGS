"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="inline-flex p-1 rounded-lg border border-border/70 bg-card/60 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === "published"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === "draft"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, slug, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Blogs List */}
      {filteredBlogs.length === 0 ? (
        <div className="p-12 rounded-xl border border-border/60 bg-card/30 text-center space-y-3">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No articles match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No articles found matching "${searchQuery}". Try a different keyword or clear the search filter.`
              : "No articles available in this view."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs mt-2"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border/40 border border-border/70 rounded-xl overflow-hidden bg-card/40">
          {filteredBlogs.map((b) => (
            <div
              key={b._id}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Thumbnail Preview */}
                <div className="w-20 h-14 sm:w-28 sm:h-18 rounded-lg overflow-hidden border border-border/70 bg-muted/40 shrink-0 flex items-center justify-center">
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={b.status === "published" ? "default" : "secondary"}
                      className="text-[10px] uppercase px-1.5 py-0"
                    >
                      {b.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
                      • By {b.author?.name}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors truncate">
                    <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {b.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="text-[11px] text-muted-foreground/60">
                      /blogs/{b.slug}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {b.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {b.commentsCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <AdminBlogActions
                blogId={b._id}
                slug={b.slug}
                title={b.title}
                status={b.status}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
