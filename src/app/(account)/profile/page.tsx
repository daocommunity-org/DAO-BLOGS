import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageSquare, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { getViewerSession, hasAdminPermission } from "@/features/auth/admin-access";
import { SignInPrompt } from "@/features/auth/sign-in-dialog";
import { ProfileActivityTabs } from "@/features/profile/profile-activity-tabs";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import Like from "@/models/Like";
import { ProfileSignOutButton } from "./profile-signout-button";

export const dynamic = "force-dynamic";

type ActivityPost = {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author?: { name?: string };
};

const publishedPost = {
  path: "blogId",
  model: Blog,
  select: "title slug",
  match: { status: "published" },
};

const activityDate = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

async function getActivity(userId: string) {
  await connectToDatabase();

  const [likesCount, commentsCount, likes, comments] = await Promise.all([
    Like.countDocuments({ userId }),
    Comment.countDocuments({ userId }),
    Like.find({ userId })
      .select("blogId createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .populate<{ blogId: ActivityPost | null }>({ ...publishedPost, select: "title slug excerpt coverImage author.name" })
      .lean(),
    Comment.find({ userId })
      .select("blogId content createdAt")
      .sort({ createdAt: -1 })
      .limit(30)
      .populate<{ blogId: ActivityPost | null }>(publishedPost)
      .lean(),
  ]);

  return {
    likesCount,
    commentsCount,
    likes: likes.filter((like) => like.blogId !== null),
    comments: comments.filter((comment) => comment.blogId !== null),
  };
}

export default async function ProfilePage() {
  const session = await getViewerSession();

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <SignInPrompt returnTo="/profile" message="Sign in to view your profile and activity." />
        </main>
        <Footer />
      </>
    );
  }

  const user = session.user;
  const [isAdmin, { likesCount, commentsCount, likes, comments }] = await Promise.all([
    hasAdminPermission(user.id),
    getActivity(user.id),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Top Breadcrumb Bar */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex min-h-8 items-center gap-2 rounded-sm text-sm font-medium text-slate-300 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blogs
            </Link>
          </div>
        </section>

        {/* Profile Identity Hero */}
        <header className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0">
                <AvatarImage
                  src={user.image || undefined}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="text-xl font-semibold rounded-full bg-primary/15 text-primary">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight wrap-anywhere text-foreground">
                  {user.name}
                </h1>
              </div>
            </div>

            {/* Profile Header Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link href="/admin/blogs" className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-10 gap-2 border-primary/35 bg-primary/10 px-3.5 font-semibold text-primary hover:border-primary/55 hover:bg-primary/15 hover:text-primary",
                })}>
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  Admin Panel
                </Link>
              )}

              <ProfileSignOutButton />
            </div>
          </div>
        </header>

        {/* Metrics Row */}
        <section className="w-full dashed-border-b">
          <div className="max-w-screen-2xl w-full mx-auto dashed-border-x grid grid-cols-1 sm:grid-cols-2">
            {/* Liked Articles Metric */}
            <div className="p-6 sm:p-8 sm:dashed-border-r max-sm:dashed-border-b flex flex-col justify-between space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary" />
                Liked Articles
              </span>
              <div className="space-y-1">
                <div className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  {likesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Posts you liked.
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
                <div className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  {commentsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comments you posted.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProfileActivityTabs
          likeCount={likes.length}
          commentCount={comments.length}
          likes={
            likes.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-base font-medium text-foreground">No liked posts yet.</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Explore the community feed and like articles to bookmark your favorite reads.
                </p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Explore articles →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {likes.map((like) => {
                  const blog = like.blogId;
                  if (!blog) return null;
                  return (
                    <article
                      key={String(like._id)}
                      className="py-6 first:pt-0 last:pb-0 group"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                              {blog.author?.name || "Author"}
                            </span>
                            <span>•</span>
                            <span>Liked on {activityDate.format(like.createdAt)}</span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                            <Link href={`/blogs/${encodeURIComponent(blog.slug)}`}>{blog.title}</Link>
                          </h3>

                          {blog.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {blog.excerpt}
                            </p>
                          )}

                          <div className="pt-1">
                            <Link
                              href={`/blogs/${encodeURIComponent(blog.slug)}`}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              Read article →
                            </Link>
                          </div>
                        </div>

                        {blog.coverImage ? (
                          <Link href={`/blogs/${encodeURIComponent(blog.slug)}`} className="shrink-0 self-start sm:self-center">
                            <Image
                              src={blog.coverImage}
                              alt={blog.title}
                              width={144}
                              height={96}
                              className="w-28 h-20 sm:w-36 sm:h-24 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                            />
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          }
          comments={
            comments.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-base font-medium text-foreground">No comments yet.</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Join discussions and share your perspective on community articles.
                </p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Browse articles →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/25">
                {comments.map((comment) => {
                  const blog = comment.blogId;
                  if (!blog) return null;
                  return (
                    <div
                      key={String(comment._id)}
                      className="py-6 first:pt-0 last:pb-0 space-y-3 group"
                    >
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground truncate">
                          <span>Commented on</span>
                          <Link
                            href={`/blogs/${encodeURIComponent(blog.slug)}`}
                            className="font-medium text-foreground hover:text-primary transition-colors truncate"
                          >
                            {blog.title}
                          </Link>
                        </div>

                        <span className="text-muted-foreground text-[11px] shrink-0">
                          {activityDate.format(comment.createdAt)}
                        </span>
                      </div>

                      {/* Editorial quote bar - clean and box-free */}
                      <p className="text-sm text-foreground/90 leading-relaxed pl-4 border-l-2 border-primary/50">
                        {comment.content}
                      </p>

                      <div>
                        <Link
                          href={`/blogs/${encodeURIComponent(blog.slug)}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          View discussion in article →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        />
      </main>

      <Footer />
    </div>
  );
}
