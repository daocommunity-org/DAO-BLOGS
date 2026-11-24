"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import { SignInDialog } from "@/features/auth/sign-in-dialog";
import { useBlogEngagement } from "@/features/blogs/blog-engagement";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface CommentItem {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
}

type CommentChange =
  | { type: "post"; draft: string; comment: CommentItem }
  | { type: "delete"; commentId: string };

export function CommentsSection({ blogId }: { blogId: string }) {
  const { data: session, isPending } = useSession();
  const { data: engagement, setCommentCount } = useBlogEngagement();
  const [signInOpen, setSignInOpen] = useState(false);
  const isAdmin = engagement?.canModerate ?? false;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState<CommentChange | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/blogs/${blogId}/comments`, { cache: "no-store" });
        if (!res.ok) throw new Error("Comments request failed.");
        const data = await res.json();
        if (isMounted) setComments(data.comments);
      } catch {
        if (isMounted) setFailed(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [attempt, blogId]);

  async function submitChange(change: CommentChange) {
    if (inFlight.current || isLoading || failed) return;

    const isPost = change.type === "post";
    const previousCount = comments.length;
    inFlight.current = true;
    setPending(change);
    if (isPost) setCommentText("");
    setCommentCount(Math.max(0, previousCount + (isPost ? 1 : -1)));

    try {
      const commentsUrl = `/api/blogs/${blogId}/comments`;
      const response = isPost
        ? await fetch(commentsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: change.comment.content }),
        })
        : await fetch(`${commentsUrl}/${change.commentId}`, { method: "DELETE" });
      const result: { success?: boolean; comment?: CommentItem; commentsCount?: number } = await response.json();
      if (!response.ok || !result.success || typeof result.commentsCount !== "number" ||
          (isPost && !result.comment)) throw new Error("Comment update failed.");

      if (change.type === "delete") {
        setComments((current) => current.filter((comment) => comment._id !== change.commentId));
      } else if (result.comment) {
        const savedComment = result.comment;
        setComments((current) => [savedComment, ...current]);
      }
      setCommentCount(result.commentsCount);
    } catch {
      setCommentCount(previousCount);
      if (isPost) setCommentText(change.draft);
      toast.error(isPost ? "Couldn’t post your comment. Try again." : "Couldn’t delete the comment. Try again.");
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  function handlePostComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || content.length > 1500 || isPending) return;

    const user = session?.user;
    if (!user) {
      setSignInOpen(true);
      return;
    }

    void submitChange({
      type: "post",
      draft: commentText,
      comment: {
        _id: "pending-comment",
        userId: user.id,
        userName: user.name,
        userImage: user.image ?? undefined,
        content,
        createdAt: new Date().toISOString(),
      },
    });
  }

  const visibleComments = pending?.type === "post"
    ? [pending.comment, ...comments]
    : pending?.type === "delete"
      ? comments.filter((comment) => comment._id !== pending.commentId)
      : comments;
  const count = isLoading || failed ? (engagement?.commentsCount ?? 0) : visibleComments.length;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {count === 0 ? "Discussion" : `${count} Comment${count !== 1 ? "s" : ""}`}
        </h3>
      </div>

      {/* Comment Input */}
      {session?.user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-muted/15 p-4 transition-colors focus-within:border-primary/60 motion-reduce:transition-none">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or feedback..."
              rows={3}
              maxLength={1500}
              aria-label="Write a comment"
              disabled={pending?.type === "post"}
              className="w-full bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-0 leading-relaxed"
            />
            <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
              <span className="min-w-0 truncate text-xs text-slate-300">
                Commenting as <span className="font-medium text-foreground">{session.user.name}</span>
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={failed || isLoading || !!pending || !commentText.trim()}
                aria-busy={pending?.type === "post"}
                className="h-9 gap-2 px-3 font-semibold enabled:cursor-pointer"
              >
                <Send aria-hidden="true" className="size-3.5" />
                Post comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-5 rounded-xl border border-border/40 bg-muted/10">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Join the discussion by signing in with your account.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs cursor-pointer rounded-lg"
            onClick={() => setSignInOpen(true)}
            disabled={isPending}
          >
            Sign in to comment
          </Button>
        </div>
      )}

      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />

      {/* Comment list */}
      <div className="space-y-6 pt-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))
        ) : failed ? (
          <div className="space-y-2 text-sm">
            <p role="alert">Couldn’t load comments.</p>
            <Button size="sm" variant="outline" onClick={() => {
              setFailed(false);
              setIsLoading(true);
              setAttempt((count) => count + 1);
            }}>Try again</Button>
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="py-8 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {visibleComments.map((c) => {
              const isAuthor = session?.user?.id === c.userId;
              const canDelete = isAuthor || isAdmin;

              return (
                <div key={c._id} className="py-5 first:pt-0 last:pb-0 flex gap-3.5">
                  <Avatar className="w-8 h-8 shrink-0 rounded-full">
                    <AvatarImage src={c.userImage} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-xs font-medium">
                      {c.userName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-foreground">
                          {c.userName}
                        </span>
                        {isAuthor && (
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                        <span className="text-muted-foreground/60 text-xs">•</span>
                        <time className="text-[11px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void submitChange({ type: "delete", commentId: c._id })}
                          disabled={!!pending}
                          aria-label="Delete comment"
                          title="Delete comment"
                          className="inline-grid size-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors enabled:cursor-pointer enabled:hover:bg-destructive/10 enabled:hover:text-destructive focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 motion-reduce:transition-none"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

