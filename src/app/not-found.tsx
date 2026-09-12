import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
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

        {/* Centered Blueprint 404 */}
        <section className="w-full flex-1 flex flex-col">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 flex-1 flex flex-col items-center justify-center dashed-border-x text-center py-20 sm:py-28">
            {/* Giant Monospace 404 */}
            <div className="text-7xl sm:text-9xl font-bold font-mono tracking-tighter text-foreground select-none">
              4<span className="text-primary">0</span>4
            </div>

            {/* Title & Description */}
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-4">
              Page or Article Not Found
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mt-2.5">
              The requested route does not exist, may have been unpublished, or moved to another URL.
            </p>

            {/* Primary Action Button */}
            <div className="flex items-center gap-3 mt-8">
              <Link href="/">
                <Button size="sm" className="gap-2 text-xs font-semibold cursor-pointer h-9 px-5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Home Feed
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
