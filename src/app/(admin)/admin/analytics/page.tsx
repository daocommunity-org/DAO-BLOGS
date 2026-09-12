import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { AdminAnalyticsView } from "@/components/admin-analytics-view";
import { ArrowLeft, BarChart3, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || userRole !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blog management
            </Link>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
          </div>
        </section>

        {/* Header Section */}
        <header className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-primary" />
                Community Engagement Analytics
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Audit and track community likes, timestamped activity, and discussions in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/blogs"
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/40 hover:border-border transition-colors"
              >
                Manage Blogs
              </Link>
            </div>
          </div>
        </header>

        {/* Analytics Feed Container */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x">
            <AdminAnalyticsView />
          </div>
        </section>
      </main>
    </div>
  );
}
