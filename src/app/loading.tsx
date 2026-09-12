import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero Header */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x space-y-3">
          <Skeleton className="h-10 w-72 sm:w-96" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
      </div>

      {/* Featured Post Card Skeleton */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x">
          <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />

              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-1.5">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-44" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Remaining Article Skeletons */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 sm:p-10 md:dashed-border-r last:border-r-0 max-md:dashed-border-b space-y-4">
              <Skeleton className="w-full aspect-[16/10] rounded-2xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <div className="flex items-center gap-2.5 pt-1">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
