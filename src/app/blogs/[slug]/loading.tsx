import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-16" />
              <span className="text-muted-foreground/40">•</span>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </section>

        {/* Blog Post Header */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Skeleton className="h-3 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-9 sm:h-12 w-full sm:w-5/6" />
              <Skeleton className="h-9 sm:h-12 w-2/3" />
            </div>

            {/* Excerpt */}
            <Skeleton className="h-5 w-3/4" />

            {/* Authors Presentation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden p-0.5">
                  <Skeleton className="w-8 h-8 rounded-full ring-2 ring-background shrink-0" />
                  <Skeleton className="w-8 h-8 rounded-full ring-2 ring-background shrink-0" />
                </div>
                <Skeleton className="h-4 w-44" />
              </div>
            </div>

            {/* Cover image skeleton */}
            <Skeleton className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl mt-4" />
          </div>
        </header>

        {/* Article Body Content */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 lg:grid-cols-[1fr_260px]">
            <div className="p-6 sm:p-10 lg:dashed-border-r min-w-0 space-y-5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />

              <div className="pt-4 space-y-3">
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="pt-4 space-y-3">
                <Skeleton className="h-7 w-2/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            {/* TOC Skeleton */}
            <div className="hidden lg:block w-[260px] p-5">
              <div className="sticky top-24 space-y-3">
                <Skeleton className="h-3.5 w-24" />
                <div className="border-l border-border/40 pl-2.5 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-2.5 w-1/2 ml-2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Reactions & Comments Section */}
        <section className="w-full flex-1 flex flex-col">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>

            <div className="space-y-4 pt-4 border-t border-border/20">
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

