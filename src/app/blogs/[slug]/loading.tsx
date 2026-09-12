import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top back navigation */}
      <div className="w-full border-b border-border/40 py-4">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 flex items-center">
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full sm:w-5/6" />
          <Skeleton className="h-10 w-2/3" />
        </div>

        {/* Excerpt */}
        <Skeleton className="h-5 w-3/4" />

        {/* Author byline & stacked avatars */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/30">
          <div className="flex -space-x-2">
            <Skeleton className="w-9 h-9 rounded-full ring-2 ring-background" />
            <Skeleton className="w-9 h-9 rounded-full ring-2 ring-background" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        {/* Cover image skeleton */}
        <Skeleton className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl" />

        {/* Body article paragraphs & diagram placeholder */}
        <div className="space-y-4 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />

          {/* Diagram card skeleton */}
          <div className="my-8 p-6 rounded-xl border border-border/40 bg-[#162032] flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-28 rounded-lg bg-white/10" />
              <Skeleton className="h-0.5 w-12 bg-white/10" />
              <Skeleton className="h-10 w-28 rounded-lg bg-white/10" />
            </div>
          </div>

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  );
}
