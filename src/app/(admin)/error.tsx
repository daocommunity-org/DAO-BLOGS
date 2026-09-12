"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RotateCcw, ArrowLeft, FileText } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Breadcrumb Section */}
      <section className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to articles list
          </Link>

          <span className="text-[11px] font-mono uppercase tracking-wider text-destructive">
            ADMIN // MODULE_EXCEPTION
          </span>
        </div>
      </section>

      {/* Header Section */}
      <header className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 dashed-border-x space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Administrative Error
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
            Admin Module Failed to Load
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            An error occurred while loading this administrative section or verifying management permissions.
          </p>
        </div>
      </header>

      {/* 2-Column Action & Diagnostic Grid */}
      <section className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
          {/* Left Action Box */}
          <div className="p-8 sm:p-10 md:dashed-border-r max-md:dashed-border-b space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Actions
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Retry Admin Task
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Retry the administrative operation or return to the main dashboard catalog.
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

              <Link href="/admin/blogs">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-medium cursor-pointer h-9 px-4"
                >
                  <FileText className="w-3.5 h-3.5" />
                  All Articles
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
              {error.message || "Unknown admin action exception."}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
