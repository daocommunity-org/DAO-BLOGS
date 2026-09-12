"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-6 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message || "An unexpected error occurred while loading this page. Please try again."}
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
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
