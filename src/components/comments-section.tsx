"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

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
    <section className="mt-16 space-y-6">
      <Separator />

      <div className="flex items-center gap-2 pt-2">
        <h3 className="text-lg font-semibold text-foreground">
          {count === 0 ? "No comments yet" : `${count} comment${count !== 1 ? "s" : ""}`}
        </h3>
      </div>

      {/* Comment input */}
      {session?.user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            disabled={isSubmitting}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !commentText.trim()}
              className="gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? "Posting…" : "Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4 px-5 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Sign in to join the conversation.
          </p>
          <Button
            size="sm"
            variant="outline"
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
      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Be the first to comment.
          </p>
        ) : (
          comments.map((c) => {
            const isAuthor = session?.user?.id === c.userId;
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={c._id} className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={c.userImage} referrerPolicy="no-referrer" />
                  <AvatarFallback className="text-xs">
                    {c.userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {c.userName}
                      </span>
                      {isAuthor && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          You
                        </Badge>
                      )}
                      <time className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This comment will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingCommentId === c._id}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(c._id)}
                              disabled={deletingCommentId === c._id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 cursor-pointer"
                            >
                              {deletingCommentId === c._id && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              {deletingCommentId === c._id ? "Deleting..." : "Confirm & Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mt-1">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

