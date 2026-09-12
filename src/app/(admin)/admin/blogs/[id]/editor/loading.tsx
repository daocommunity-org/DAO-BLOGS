import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Sticky bar skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md shrink-0">
        <div className="max-w-full px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-4 w-28" />
            <span className="text-border/60 select-none">·</span>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Editor area skeleton */}
      <div className="flex-1 bg-muted/10 flex flex-col justify-start gap-4 p-6 sm:p-10">
        <div className="flex items-center gap-3 pb-2 border-b border-border/20">
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-7 w-20 rounded" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}
