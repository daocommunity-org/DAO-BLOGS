import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Bar Skeleton */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
        </section>

      {/* Header Section Skeleton */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-3/4 sm:w-1/2" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Skeleton */}
      <div className="w-full dashed-border-b bg-muted/5">
        <div className="max-w-screen-2xl mx-auto dashed-border-x grid grid-cols-1 sm:grid-cols-2">
          <div className="p-6 sm:p-8 sm:dashed-border-r space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </div>

        {/* List section skeleton */}
        <section className="w-full flex-1 flex flex-col dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-8 dashed-border-x flex-1 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
            <div className="divide-y divide-border/20">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

