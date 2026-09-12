"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Calendar,
  User,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AnalyticsItem {
  id: string;
  createdAt: string;
  content?: string;
  user: {
    id: string;
    name: string;
    email?: string;
    image?: string;
  };
  blog: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
  } | null;
}

interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface SummaryState {
  totalLikes: number;
  totalComments: number;
  totalBlogs: number;
}

interface ActiveBlog {
  id: string;
  title: string;
  slug: string;
}

export function AdminAnalyticsView() {
  const [tab, setTab] = useState<"likes" | "comments">("likes");
  const [page, setPage] = useState(1);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [items, setItems] = useState<AnalyticsItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
  });
  const [summary, setSummary] = useState<SummaryState>({
    totalLikes: 0,
    totalComments: 0,
    totalBlogs: 0,
  });
  const [activeBlogs, setActiveBlogs] = useState<ActiveBlog[]>([]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tab,
        page: page.toString(),
        limit: "15",
      });

      if (selectedBlogId) params.set("blogId", selectedBlogId);
      if (debouncedQuery) params.set("query", debouncedQuery);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load analytics data");
      }

      setItems(json.data.items || []);
      setPagination(json.data.pagination);
      setSummary(json.data.summary);
      setActiveBlogs(json.data.activeBlogs || []);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      toast.error(err.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, [tab, page, selectedBlogId, debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (newTab: "likes" | "comments") => {
    if (newTab !== tab) {
      setTab(newTab);
      setPage(1);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* 3-Stat Minimal Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/30 border border-border/40 rounded-xl overflow-hidden bg-muted/5">
        <div className="p-6 flex flex-col justify-between space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-primary" />
            Total Likes Given
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-foreground">
            {summary.totalLikes}
          </div>
          <p className="text-[11px] text-muted-foreground">Across all community posts</p>
        </div>

        <div className="p-6 flex flex-col justify-between space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            Total Comments
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-foreground">
            {summary.totalComments}
          </div>
          <p className="text-[11px] text-muted-foreground">Active community discussions</p>
        </div>

        <div className="p-6 flex flex-col justify-between space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            Monitored Articles
          </span>
          <div className="text-2xl sm:text-3xl font-semibold text-foreground">
            {summary.totalBlogs}
          </div>
          <p className="text-[11px] text-muted-foreground">Published and draft entries</p>
        </div>
      </div>

      {/* Underline Tabs & Controls Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border/40 pb-px">
        {/* Clean Underline Tabs */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => handleTabChange("likes")}
            className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative flex items-center gap-2 ${
              tab === "likes"
                ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Likes Activity ({summary.totalLikes})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("comments")}
            className={`pb-3.5 text-sm font-medium transition-colors cursor-pointer relative flex items-center gap-2 ${
              tab === "comments"
                ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments Activity ({summary.totalComments})</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pb-2 md:pb-3">
          {/* Post Filter Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedBlogId}
              onChange={(e) => {
                setSelectedBlogId(e.target.value);
                setPage(1);
              }}
              className="w-full appearance-none bg-muted/10 border border-border/50 focus:border-primary/60 rounded-lg pl-3 pr-8 py-1.5 text-xs text-foreground outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-background text-foreground">
                All Articles
              </option>
              {activeBlogs.map((b) => (
                <option key={b.id} value={b.id} className="bg-background text-foreground">
                  {b.title}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={tab === "likes" ? "Search user name / email..." : "Search comment / author..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/10 border border-border/50 focus:border-primary/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={isLoading}
            className="h-8 px-2.5 rounded-lg border border-border/40 hover:border-border text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main List Section */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading analytics log...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          {tab === "likes" ? (
            <Heart className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          ) : (
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          )}
          <h3 className="text-base font-medium text-foreground">No records found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {selectedBlogId || debouncedQuery
              ? "No activity matches the current filters. Try changing or clearing your search."
              : `No ${tab} have been recorded yet.`}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              {/* User and Activity Info */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <Avatar className="w-8 h-8 rounded-full shrink-0 mt-0.5 sm:mt-0">
                  <AvatarImage
                    src={item.user.image}
                    alt={item.user.name}
                    referrerPolicy="no-referrer"
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {item.user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {item.user.name}
                    </span>

                    {item.user.email && (
                      <>
                        <span className="text-muted-foreground/40 text-xs">•</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {item.user.email}
                        </span>
                      </>
                    )}

                    <span className="text-muted-foreground/40 text-xs">•</span>
                    <time className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-60" />
                      {formatDate(item.createdAt)}
                    </time>
                  </div>

                  {/* If comment, show comment text content */}
                  {tab === "comments" && item.content && (
                    <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-line pt-0.5">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  )}

                  {/* Article target badge */}
                  {item.blog ? (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                        {tab === "likes" ? "Liked" : "On"}:
                      </span>
                      <Link
                        href={`/blogs/${item.blog.slug}`}
                        target="_blank"
                        className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 truncate max-w-sm sm:max-w-md"
                      >
                        <span className="truncate">{item.blog.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                      </Link>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50 italic">
                      Article removed or unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Action / Badge indicator */}
              <div className="shrink-0 self-end sm:self-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    tab === "likes"
                      ? "bg-primary/10 text-primary border-primary/25"
                      : "bg-muted/40 text-muted-foreground border-border/40"
                  }`}
                >
                  {tab === "likes" ? (
                    <>
                      <Heart className="w-3 h-3 fill-primary text-primary" />
                      <span>Post Liked</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      <span>Comment</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/30 pt-4 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{pagination.totalItems}</span> events
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border/40 hover:border-border text-foreground bg-muted/20 hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 py-1 text-[11px] text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border/40 hover:border-border text-foreground bg-muted/20 hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
