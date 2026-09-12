import { Skeleton } from "@/components/ui/skeleton";

export default function EditLoading() {
  return (
    <div className="w-full flex flex-col">
      {/* Sticky bar skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-4 w-24" />
            <span className="text-border/60 select-none">·</span>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Page header skeleton */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-8 dashed-border-x space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-72" />
        </div>
      </div>

      {/* 2-column grid skeleton */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
          {/* Left column */}
          <div className="p-6 sm:p-10 md:dashed-border-r max-md:dashed-border-b space-y-6">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>

            {/* Title field */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Slug field */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-3 w-40" />
            </div>

            {/* Excerpt field */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-20 w-full rounded-md" />
            </div>

            {/* Tags field */}
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Co-authors field */}
            <div className="space-y-2.5 pt-2 border-t border-border/30">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Right column */}
          <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <Skeleton className="w-full aspect-[16/9] rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Open Editor CTA skeleton */}
      <div className="w-full dashed-border-b">
        <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x">
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
