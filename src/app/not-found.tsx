import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Section */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>

            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              HTTP // 404_NOT_FOUND
            </span>
          </div>
        </section>

        {/* Header Section */}
        <header className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 dashed-border-x space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-mono">
              4<span className="text-primary">0</span>4 — Page Not Found
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              The article, route, or resource you requested could not be located. It may have been unpublished, moved, or deleted.
            </p>
          </div>
        </header>

        {/* Action Section */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                Looking for community articles?
              </h3>
              <p className="text-xs text-muted-foreground">
                Explore tutorials, governance posts, and decentralized engineering articles on the main feed.
              </p>
            </div>

            <Link href="/">
              <Button size="sm" className="gap-2 text-xs font-semibold cursor-pointer h-9 px-4 shrink-0">
                <Home className="w-3.5 h-3.5" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
