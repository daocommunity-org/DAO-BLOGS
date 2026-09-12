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

  const baseCount = hasLiked ? likesCount - 1 : likesCount;
  const targetCount = baseCount + 1;

  return (
    <div className="relative inline-flex items-center select-none">
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={isLoading}
        aria-label={hasLiked ? "Unlike post" : "Like post"}
        className={`group relative flex items-center h-10 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 disabled:opacity-75 shadow-sm border ${
          hasLiked
            ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(31,182,255,0.15)]"
            : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/35"
        }`}
      >
        {/* Left Part: Rolling Number Badge */}
        <div
          className={`h-full px-3.5 flex items-center justify-center font-semibold text-xs tracking-tight transition-all duration-300 border-r ${
            hasLiked
              ? "bg-primary text-primary-foreground border-primary/40 shadow-inner"
              : "bg-muted/40 text-muted-foreground group-hover:text-foreground border-border/40"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <div className="relative h-4 overflow-hidden flex flex-col items-center justify-center leading-none min-w-[1.2rem]">
              <span
                className={`transition-all duration-300 transform inline-block ${
                  hasLiked
                    ? "-translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
                }`}
              >
                {baseCount}
              </span>
              <span
                className={`transition-all duration-300 transform absolute inline-block ${
                  hasLiked
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0 pointer-events-none"
                }`}
              >
                {targetCount}
              </span>
            </div>
          )}
        </div>

        {/* Right Part: Icon & Label */}
        <div className="h-full px-3.5 flex items-center gap-2 transition-transform duration-200">
          <svg
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={2}
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-all duration-300 transform ${
              hasLiked
                ? "text-primary scale-110 fill-primary/20 rotate-[-8deg]"
                : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
            }`}
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span
            className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
              hasLiked
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            }`}
          >
            {hasLiked ? "Liked" : "Like"}
          </span>
        </div>
      </button>
    </div>
  );
}

