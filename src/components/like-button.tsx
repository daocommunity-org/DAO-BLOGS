"use client";

import { useState } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  blogId: string;
  initialLikesCount: number;
  initialHasLiked?: boolean;
}

export function LikeButton({
  blogId,
  initialLikesCount,
  initialHasLiked = false,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (!session?.user) {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      });
      return;
    }

    if (isLoading) return;

    const previousLiked = hasLiked;
    const previousCount = likesCount;
    setHasLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/blogs/${blogId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle like");
      }
      setHasLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err: any) {
      console.error("Like toggle error:", err);
      setHasLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error(err.message || "Failed to update like");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isLoading}
      aria-label={hasLiked ? "Unlike post" : "Like post"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-75 ${
        hasLiked
          ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
      ) : (
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            hasLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
          }`}
        />
      )}
      <span className="font-mono text-xs">{likesCount}</span>
    </button>
  );
}

