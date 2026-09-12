"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FileQuestion, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogError({ error, reset }: BlogErrorProps) {
  useEffect(() => {
    console.error("Blog post error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border/60 bg-card/40 space-y-6 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Article unavailable
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message || "We couldn't render this article or its interactive diagram. It may have been unpublished or removed."}
          </p>
          {error.digest && (
            <span className="text-[10px] font-mono text-muted-foreground/60 block pt-1">
              Error Digest: {error.digest}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            className="gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try again
          </Button>

          <Link href="/">
            <Button size="sm" className="gap-1.5 text-xs font-medium cursor-pointer">
              <Home className="w-3.5 h-3.5" />
              Community Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
