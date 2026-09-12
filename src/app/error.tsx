"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Breadcrumb Section */}
      <section className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to blogs
          </Link>

          <span className="text-[11px] font-mono uppercase tracking-wider text-destructive">
            SYS // RUNTIME_EXCEPTION
          </span>
        </div>
      </section>

      {/* Header Section */}
      <header className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 dashed-border-x space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              Runtime Error
            </span>
            {error.digest && (
              <>
                <span className="text-muted-foreground/40 text-xs">•</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  DIGEST: {error.digest}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-mono">
            5<span className="text-destructive">0</span>0 — Execution Interrupted
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            An unexpected error occurred during page compilation or data evaluation. You can retry the operation or return to the main feed.
          </p>
        </div>
      </header>

      {/* 2-Column Action & Diagnostic Grid */}
      <section className="w-full flex-1 flex flex-col">
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x flex-1 grid grid-cols-1 md:grid-cols-2">
          {/* Left Action Box */}
          <div className="p-8 sm:p-10 md:dashed-border-r max-md:dashed-border-b space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Recovery
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Retry State Execution
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attempt to re-render the current component tree without performing a full browser reload.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                onClick={() => reset()}
                className="gap-2 text-xs font-semibold cursor-pointer h-9 px-4"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Now
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-medium cursor-pointer h-9 px-4"
                >
                  <Home className="w-3.5 h-3.5" />
                  Homepage
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Diagnostic Box */}
          <div className="p-8 sm:p-10 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Diagnostic Message
            </span>
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-destructive font-mono break-words leading-relaxed">
              {error.message || "Unknown client-side exception."}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
