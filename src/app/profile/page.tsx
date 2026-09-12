import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import Like from "@/models/Like";
import { Navbar } from "@/components/navbar";
import { ProfileSignOutButton } from "./profile-signout-button";
import { ProfileActivityTabs } from "@/components/profile-activity-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Heart,
  ShieldCheck,
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
  let userComments: any[] = [];
  let likedBlogs: any[] = [];

  try {
    await connectToDatabase();

    const [bCount, cCount, lCount, rawUserBlogs, rawComments, rawLikes] =
      await Promise.all([
        isAdmin ? Blog.countDocuments({ "author.id": user.id }) : 0,
        Comment.countDocuments({ userId: user.id }),
        Like.countDocuments({ userId: user.id }),
        isAdmin
          ? Blog.find({ "author.id": user.id })
              .sort({ createdAt: -1 })
              .limit(20)
              .lean()
          : [],
        Comment.find({ userId: user.id })
          .populate({ path: "blogId", select: "title slug" })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean(),
        Like.find({ userId: user.id })
          .populate({
            path: "blogId",
            select: "title slug excerpt author createdAt coverImage status",
          })
          .sort({ createdAt: -1 })
          .limit(30)
          .lean(),
      ]);

    blogsCount = bCount;
    commentsCount = cCount;
    likesCount = lCount;
    authoredBlogs = JSON.parse(JSON.stringify(rawUserBlogs));
    userComments = JSON.parse(JSON.stringify(rawComments)).filter(
      (c: any) => c.blogId != null
    );
    likedBlogs = JSON.parse(JSON.stringify(rawLikes)).filter(
      (l: any) => l.blogId != null
    );
  } catch (err) {
    console.error("Profile data fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>
          </div>
        </section>

        {/* Profile Identity Hero */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-5">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="text-xl font-semibold rounded-full bg-primary/15 text-primary">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  {user.name}
                </h1>

                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>

                <p className="text-[11px] text-muted-foreground/70 truncate pt-0.5">
                  ID: {user.id}
                </p>
              </div>
            </div>

            {/* Profile Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link href="/admin/blogs">
                  <Button size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Panel
                  </Button>
                </Link>
              )}

              <ProfileSignOutButton />
            </div>
          </div>
        </header>

        {/* Metrics Row */}
        <section className="w-full dashed-border-b">
          <div
            className={`max-w-screen-2xl w-full mx-auto dashed-border-x grid ${
              isAdmin
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {/* Articles Metric (Admin Only) */}
            {isAdmin && (
              <div className="p-6 sm:p-8 sm:dashed-border-r max-sm:dashed-border-b flex flex-col justify-between space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Articles Authored
                </span>
                <div className="space-y-1">
                  <div className="text-3xl font-semibold text-foreground">
                    {blogsCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Published and draft contributions.
                  </p>
                </div>
              </div>
            )}

            {/* Liked Articles Metric */}
            <div
              className={`p-6 sm:p-8 ${
                isAdmin ? "sm:dashed-border-r" : "sm:dashed-border-r"
              } max-sm:dashed-border-b flex flex-col justify-between space-y-3`}
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" />
                Liked Articles
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-semibold text-foreground">
                  {likesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Articles you have appreciated.
                </p>
              </div>
            </div>

            {/* Comments Metric */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Comments Shared
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-semibold text-foreground">
                  {commentsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Discussions posted on articles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Activity Tabs (Liked articles, comments, and authored articles for admin) */}
        <ProfileActivityTabs
          isAdmin={isAdmin}
          authoredBlogs={authoredBlogs}
          likedBlogs={likedBlogs}
          comments={userComments}
        />
      </main>
    </div>
  );
}
