import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import Like from "@/models/Like";
import { Navbar } from "@/components/navbar";
import { ProfileSignOutButton } from "./profile-signout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Plus,
  FileText,
  MessageSquare,
  Heart,
  ShieldCheck,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  const userRole = (user as { role?: string } | undefined)?.role || "member";
  const isAdmin = userRole === "admin";

  let blogsCount = 0;
  let commentsCount = 0;
  let likesCount = 0;
  let authoredBlogs: any[] = [];

  try {
    await connectToDatabase();

    const [bCount, cCount, lCount, userBlogs] = await Promise.all([
      Blog.countDocuments({ "author.id": user.id }),
      Comment.countDocuments({ userId: user.id }),
      Like.countDocuments({ userId: user.id }),
      Blog.find({ "author.id": user.id }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    blogsCount = bCount;
    commentsCount = cCount;
    likesCount = lCount;
    authoredBlogs = JSON.parse(JSON.stringify(userBlogs));
  } catch (err) {
    console.error("Profile data fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>

            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              DAO IDENTITY // {isAdmin ? "CORE_ADMIN" : "COMMUNITY_MEMBER"}
            </span>
          </div>
        </section>

        {/* Profile Identity Hero */}
        <header className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-5">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-border/70 bg-card/60 shrink-0">
                <AvatarImage src={user.image || undefined} alt={user.name} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-xl font-bold rounded-xl">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5"
                  >
                    {isAdmin ? (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Member
                      </span>
                    )}
                  </Badge>
                </div>

                <p className="text-sm font-mono text-muted-foreground truncate">
                  {user.email}
                </p>

                <p className="text-[11px] font-mono text-muted-foreground/70 truncate pt-0.5">
                  ID: {user.id}
                </p>
              </div>
            </div>

            {/* Profile Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <>
                  <Link href="/admin/blogs/new">
                    <Button size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      Write Post
                    </Button>
                  </Link>

                  <Link href="/admin/blogs">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                      Admin Workspace
                    </Button>
                  </Link>
                </>
              )}

              <ProfileSignOutButton />
            </div>
          </div>
        </header>

        {/* 3-Column Metrics Row */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-3">
            {/* Articles Metric */}
            <div className="p-6 sm:p-8 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Articles Authored
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-foreground">
                  {blogsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Published and draft contributions to the DAO.
                </p>
              </div>
            </div>

            {/* Comments Metric */}
            <div className="p-6 sm:p-8 md:dashed-border-r max-md:dashed-border-b flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Comments Shared
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-foreground">
                  {commentsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Discussions and feedback posted on articles.
                </p>
              </div>
            </div>

            {/* Reactions Metric */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" />
                Reactions Given
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-foreground">
                  {likesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Articles appreciated across the platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Authored Articles Section */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-12 dashed-border-x space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {isAdmin ? "Your Authored Articles" : "Your Activity"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAdmin
                    ? "Manage and inspect your contributions to the community."
                    : "Activity log and engagement records for your account."}
                </p>
              </div>

              {isAdmin && authoredBlogs.length > 0 && (
                <Link href="/admin/blogs">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                    View All in Workspace →
                  </Button>
                </Link>
              )}
            </div>

            {authoredBlogs.length === 0 ? (
              <div className="p-10 rounded-xl border border-border/60 bg-card/30 text-center space-y-3">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No articles authored yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {isAdmin
                    ? "You haven't authored any articles yet. Create your first post with the markdown & mermaid editor."
                    : "You are currently a community reader. Engage with articles by leaving reactions and joining discussions."}
                </p>
                {isAdmin && (
                  <div className="pt-2">
                    <Link href="/admin/blogs/new">
                      <Button size="sm" variant="outline" className="text-xs">
                        Write Your First Article
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/40 border border-border/60 rounded-xl overflow-hidden bg-card/40">
                {authoredBlogs.map((b: any) => (
                  <div
                    key={b._id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={b.status === "published" ? "default" : "secondary"}
                          className="text-[10px] uppercase font-mono px-1.5 py-0"
                        >
                          {b.status}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {new Date(b.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                        <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {b.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {b.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {b.commentsCount || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link href={`/blogs/${b.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs cursor-pointer">
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Button>
                      </Link>

                      {isAdmin && (
                        <Link href={`/admin/blogs/${b._id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs cursor-pointer">
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
