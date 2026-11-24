"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

interface Engagement {
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  canModerate: boolean;
}

interface EngagementContext {
  data: Engagement | null;
  failed: boolean;
  retry: () => void;
  setLike: (hasLiked: boolean, likesCount: number) => void;
  setCommentCount: (commentsCount: number) => void;
}

const BlogEngagementContext = createContext<EngagementContext | null>(null);

export function BlogEngagement({ blogId, children }: { blogId: string; children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [result, setResult] = useState<{ blogId: string; userId?: string; data: Engagement | null } | null>(null);
  const [comments, setComments] = useState<{ blogId: string; count: number }>();
  const [attempt, setAttempt] = useState(0);
  const current = result?.blogId === blogId && result.userId === userId ? result : null;
  const data = current?.data
    ? { ...current.data, commentsCount: comments?.blogId === blogId ? comments.count : current.data.commentsCount }
    : null;

  useEffect(() => {
    if (isPending) return;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/blogs/${blogId}/engagement`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Engagement request failed.");
        const data: Engagement = await response.json();
        if (!controller.signal.aborted) setResult({ blogId, userId, data });
      } catch {
        if (!controller.signal.aborted) setResult({ blogId, userId, data: null });
      }
    }

    void load();
    return () => controller.abort();
  }, [attempt, blogId, isPending, userId]);

  function update(values: Partial<Engagement>) {
    setResult((current) => current?.data && current.blogId === blogId && current.userId === userId
      ? { ...current, data: { ...current.data, ...values } }
      : current);
  }

  return (
    <BlogEngagementContext.Provider value={{
      data,
      failed: current?.data === null,
      retry: () => {
        setResult(null);
        setAttempt((count) => count + 1);
      },
      setLike: (hasLiked, likesCount) => update({ hasLiked, likesCount }),
      setCommentCount: (count) => setComments({ blogId, count }),
    }}>
      {children}
    </BlogEngagementContext.Provider>
  );
}

export function useBlogEngagement() {
  const context = useContext(BlogEngagementContext);
  if (!context) throw new Error("Blog engagement requires a provider.");
  return context;
}

export function BlogEngagementCounts() {
  const { data, failed, retry } = useBlogEngagement();
  if (failed) {
    return <button type="button" onClick={retry} className="text-xs underline">Retry loading reactions</button>;
  }
  if (!data) return null;
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span>{data.likesCount} {data.likesCount === 1 ? "like" : "likes"}</span>
      <span aria-hidden="true">•</span>
      <span>{data.commentsCount} {data.commentsCount === 1 ? "comment" : "comments"}</span>
    </div>
  );
}
