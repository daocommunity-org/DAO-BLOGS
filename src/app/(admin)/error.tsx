"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-6 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded">
            Admin Portal Error
          </span>
          <h2 className="text-xl font-semibold text-foreground tracking-tight pt-1">
            Failed to load admin module
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error.message || "An error occurred while loading this admin section or verifying permissions."}
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
            Retry
          </Button>

          <Link href="/admin/blogs">
            <Button size="sm" className="gap-1.5 text-xs font-medium cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
