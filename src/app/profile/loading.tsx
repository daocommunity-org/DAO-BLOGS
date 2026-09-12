import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
          </div>
        </section>

        {/* Profile Identity Hero */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-5">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-44 sm:w-56" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </header>

        {/* Metrics Row */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 sm:dashed-border-r last:border-r-0 max-sm:dashed-border-b flex flex-col justify-between space-y-3"
              >
                <Skeleton className="h-3.5 w-32" />
                <div className="space-y-1.5">
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* User Activity Tabs */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x space-y-8">
            {/* Underline Tabs */}
            <div className="flex items-center gap-8 border-b border-border/40 pb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Activity List Items */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border border-border/40 bg-card/40 flex items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-3 w-20 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
