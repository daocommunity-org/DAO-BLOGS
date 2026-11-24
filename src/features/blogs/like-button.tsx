"use client";

import { Heart } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SignInDialog } from "@/features/auth/sign-in-dialog";
import { useSession } from "@/lib/auth-client";
import { useBlogEngagement } from "./blog-engagement";

export function LikeButton({ blogId }: { blogId: string }) {
  const { data: session, isPending } = useSession();
  const { data, setLike } = useBlogEngagement();
  const [signInOpen, setSignInOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const hasLiked = data?.hasLiked ?? false;

  async function toggleLike() {
    if (isPending || inFlight.current) return;
    if (!session?.user) {
      setSignInOpen(true);
      return;
    }
    if (!data) return;

    const previousLiked = data.hasLiked;
    const previousCount = data.likesCount;
    inFlight.current = true;
    setSaving(true);
    setLike(!previousLiked, Math.max(0, previousCount + (previousLiked ? -1 : 1)));

    try {
      const response = await fetch(`/api/blogs/${blogId}/like`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success ||
          typeof result.liked !== "boolean" || typeof result.likesCount !== "number") {
        throw new Error("Like update failed.");
      }
      setLike(result.liked, result.likesCount);
    } catch {
      setLike(previousLiked, previousCount);
      toast.error(previousLiked ? "Couldn’t remove your like. Try again." : "Couldn’t like this post. Try again.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={toggleLike}
        disabled={saving || isPending || (!!session?.user && !data)}
        aria-label={hasLiked ? "Unlike post" : "Like post"}
        aria-pressed={hasLiked}
        aria-busy={saving}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-border/70 bg-muted/25 px-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-primary/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default aria-pressed:border-primary/50 aria-pressed:bg-primary/10 aria-pressed:text-primary motion-reduce:transition-none"
      >
        <Heart aria-hidden="true" className={hasLiked ? "size-4 fill-current" : "size-4"} />
        {hasLiked ? "Liked" : "Like"}
        <span aria-hidden="true" className="min-w-7 border-l border-current/20 pl-2 text-center text-xs tabular-nums">
          {data?.likesCount ?? "–"}
        </span>
      </button>
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
}
