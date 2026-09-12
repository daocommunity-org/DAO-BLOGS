"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

interface CommentItem {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
}

interface CommentsSectionProps {
  blogId: string;
  initialCommentsCount: number;
}

export function CommentsSection({
  blogId,
  initialCommentsCount,
}: CommentsSectionProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "admin";

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/blogs/${blogId}/comments`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [blogId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!session?.user) {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post comment");
      }
      setComments([data.comment, ...comments]);
      setCommentText("");
      toast.success("Comment posted successfully.");
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      toast.error(err.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      toast.error(err.message || "Failed to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const count = comments.length || initialCommentsCount;

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
          <div className="relative border border-border/50 focus-within:border-primary/60 rounded-xl bg-muted/10 transition-colors p-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or feedback..."
              rows={3}
              disabled={isSubmitting}
              className="w-full bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-0 leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <span className="text-[11px] text-muted-foreground">
                Commenting as <span className="text-foreground font-medium">{session.user.name}</span>
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !commentText.trim()}
                className="gap-1.5 cursor-pointer text-xs font-medium px-4 h-8 rounded-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isSubmitting ? "Posting…" : "Post Comment"}
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
            onClick={() =>
              signIn.social({
                provider: "google",
                callbackURL: window.location.pathname,
              })
            }
          >
            Sign in to comment
          </Button>
        </div>
      )}

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
        ) : comments.length === 0 ? (
          <div className="py-8 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {comments.map((c) => {
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
                          onClick={() => handleDeleteComment(c._id)}
                          disabled={deletingCommentId === c._id}
                          title="Delete comment"
                          className="group relative flex items-center h-7 w-[96px] rounded-md overflow-hidden bg-[#e62222] hover:bg-[#ff3636] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 select-none shadow-sm"
                        >
                          {/* Label Text */}
                          <span className="w-full text-left pl-3 text-xs font-semibold text-white tracking-wide transition-all duration-200 group-hover:text-transparent">
                            {deletingCommentId === c._id ? "Deleting" : "Delete"}
                          </span>

                          {/* Icon Container that slides across full button on hover */}
                          <span className="absolute right-0 top-0 bottom-0 w-7 flex items-center justify-center border-l border-[#c41b1b] transition-all duration-200 group-hover:w-full group-hover:border-l-0">
                            {deletingCommentId === c._id ? (
                              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-3 h-3 fill-white transition-transform duration-200 group-active:scale-75"
                              >
                                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                              </svg>
                            )}
                          </span>
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

