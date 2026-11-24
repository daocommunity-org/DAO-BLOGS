"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Heart, Image as ImageIcon, MessageSquare, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBlogActions } from "./admin-blog-actions";

export interface AdminBlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  status: "draft" | "published";
  authorName?: string;
  coAuthorCount: number;
  createdAt?: string;
  likesCount: number;
  commentsCount: number;
  canEdit: boolean;
  canDelete: boolean;
}

type StatusFilter = AdminBlogListItem["status"] | "all";
const formatDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function AdminBlogsManager({ blogs }: { blogs: AdminBlogListItem[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const query = search.trim().toLowerCase();
  const filteredBlogs = blogs.filter((post) =>
    (status === "all" || post.status === status) &&
    (!query || [post.title, post.slug, post.authorName].some((value) => value?.toLowerCase().includes(query))),
  );
  const publishedCount = blogs.filter((post) => post.status === "published").length;
  const filters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: blogs.length },
    { value: "published", label: "Published", count: publishedCount },
    { value: "draft", label: "Drafts", count: blogs.length - publishedCount },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-x-5 gap-y-2 border-b border-border/50 sm:flex-row sm:items-end sm:justify-between">
        <div role="group" aria-label="Filter by publication status" className="flex flex-wrap items-center gap-x-3 sm:gap-x-5">
          {filters.map((filter) => (
            <button key={filter.value} type="button" aria-pressed={status === filter.value}
              className="group relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-t-md px-1 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:inset-x-0 aria-pressed:after:bottom-0 aria-pressed:after:h-0.5 aria-pressed:after:bg-primary motion-reduce:transition-none"
              onClick={() => setStatus(filter.value)}>
              {filter.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums text-slate-200 group-aria-pressed:bg-primary/15 group-aria-pressed:text-primary">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative mb-3 w-full sm:max-w-xs">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-400" />
          <Input type="text" inputMode="search" aria-label="Search articles" placeholder="Search articles…"
            value={search} onChange={(event) => setSearch(event.target.value)}
            className="h-10 border-border/70 bg-muted/15 pr-9 pl-9 text-sm" />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => setSearch("")}
              className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary">
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" role="status">{filteredBlogs.length} matching articles</p>
      {filteredBlogs.length === 0 ? (
        <div className="space-y-3 py-12 text-center">
          <FileText aria-hidden="true" className="mx-auto size-6 text-slate-400" />
          <h2 className="text-base font-semibold">{blogs.length ? "No matching articles" : "No articles yet"}</h2>
          {blogs.length ? (
            <Button type="button" variant="outline" onClick={() => { setSearch(""); setStatus("all"); }}>
              Clear filters
            </Button>
          ) : (
            <Link href="/admin/blogs/new" className={buttonVariants({ variant: "outline" })}>Write a post</Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border/45">
          {filteredBlogs.map((post) => {
            const articleUrl = post.status === "published"
              ? `/blogs/${encodeURIComponent(post.slug)}`
              : `/admin/blogs/${post.id}/preview`;

            return (
              <article key={post.id} className="flex flex-col items-start justify-between gap-4 py-6 first:pt-0 md:flex-row md:items-center md:gap-6">
                <div className="flex w-full min-w-0 flex-1 items-start gap-3 sm:gap-5">
                  <Thumbnail image={post.coverImage} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300">
                      <span className={post.status === "published"
                        ? "rounded-full bg-emerald-400/10 px-2 py-0.5 font-medium text-emerald-300"
                        : "rounded-full bg-muted px-2 py-0.5 font-medium text-slate-200"}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                      {post.createdAt && <time dateTime={post.createdAt}>{formatDate.format(new Date(post.createdAt))}</time>}
                      {post.authorName && <span className="hidden sm:inline">By {post.authorName}</span>}
                      {post.coAuthorCount > 0 && (
                        <span className="hidden sm:inline">+{post.coAuthorCount} co-author{post.coAuthorCount === 1 ? "" : "s"}</span>
                      )}
                    </div>

                    <h2 className="line-clamp-2 text-base leading-snug font-semibold wrap-anywhere sm:text-lg">
                      <Link href={articleUrl} className="rounded-sm underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && <p className="line-clamp-2 max-w-2xl text-xs leading-relaxed wrap-anywhere text-slate-300">{post.excerpt}</p>}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-slate-300">
                      <span className="max-w-full truncate font-mono text-[11px] text-slate-400">/blogs/{post.slug}</span>
                      <Link href={`/admin/blogs/${post.id}/analytics`} aria-label={`${post.likesCount} likes and ${post.commentsCount} comments for ${post.title}`}
                        className="inline-flex items-center gap-3 rounded-sm tabular-nums hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
                        <span className="inline-flex items-center gap-1">
                          <Heart aria-hidden="true" className="size-3.5" /> {post.likesCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare aria-hidden="true" className="size-3.5" /> {post.commentsCount}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 md:w-auto md:justify-end">
                  <AdminBlogActions blogId={post.id} slug={post.slug} title={post.title} status={post.status}
                    canEdit={post.canEdit} canDelete={post.canDelete} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Thumbnail({ image }: { image?: string }) {
  const [brokenImage, setBrokenImage] = useState<string>();

  return (
    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/55 bg-muted/20 sm:h-20 sm:w-28">
      {image && image !== brokenImage ? (
        <Image src={image} alt="" width={112} height={80} unoptimized referrerPolicy="no-referrer"
          className="h-full w-full object-cover" onError={() => setBrokenImage(image)} />
      ) : <ImageIcon aria-hidden="true" className="size-5 text-slate-400" />}
    </div>
  );
}
