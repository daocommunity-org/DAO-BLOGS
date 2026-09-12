import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBlogsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
          </div>
        </section>

        {/* Header Section */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </header>

        {/* Metrics Grid */}
        <section className="w-full dashed-border-b bg-muted/5">
          <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 md:p-8 md:dashed-border-r last:border-r-0 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        </section>

        {/* Table / Article Cards List */}
        <section className="w-full flex-1 flex flex-col">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-8 dashed-border-x flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-border/40 bg-card/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

