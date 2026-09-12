import { Navbar } from "@/components/navbar";
import { connectToDatabase } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const revalidate = 60;

function formatDate(date: string | Date) {
  return new Date(date)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

async function getBlogs() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(24)
      .select("title slug excerpt coverImage tags author likesCount commentsCount createdAt")
      .lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function HomePage() {
  const blogs = await getBlogs();
  const featuredPost = blogs[0];
  const remainingPosts = blogs.slice(1);

  // Group remaining posts in pairs of 2 for grid rows
  const rows = [];
  for (let i = 0; i < remainingPosts.length; i += 2) {
    rows.push(remainingPosts.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* Hero Header (No center vertical line) */}
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14 dashed-border-x">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
              DAO Community <span className="text-primary font-semibold">Blog</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl leading-relaxed">
              Ideas, technical deep dives, and stories from our community.
            </p>
          </div>
        </section>

        {blogs.length === 0 ? (
          <section className="w-full dashed-border-b">
            <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-20 dashed-border-x text-center">
              <p className="text-sm text-muted-foreground">No blogs published yet.</p>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Post (Big single row - no center vertical line) */}
            {featuredPost && (
              <section className="w-full dashed-border-b">
                <div className="max-w-6xl w-full mx-auto p-6 sm:p-10 dashed-border-x">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          {formatDate(featuredPost.createdAt)}
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors leading-tight">
                          <Link href={`/blogs/${featuredPost.slug}`}>
                            {featuredPost.title}
                          </Link>
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <Avatar className="w-6 h-6 border border-border/60">
                          <AvatarImage
                            src={featuredPost.author?.image}
                            alt={featuredPost.author?.name}
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="text-[10px] font-medium">
                            {featuredPost.author?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground/80 font-medium">
                          {featuredPost.author?.name}
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <Link href={`/blogs/${featuredPost.slug}`} className="w-full block group">
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border/60 bg-muted/30">
                          {featuredPost.coverImage ? (
                            <Image
                              src={featuredPost.coverImage}
                              alt={featuredPost.title}
                              fill
                              priority
                              sizes="(max-width: 1024px) 100vw, 500px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground text-xs">
                              Cover Image
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2-Column Grid Rows (No cover images, separated by dashed lines) */}
            {rows.map((row, rowIndex) => (
              <section key={rowIndex} className="w-full dashed-border-b">
                <div className="max-w-6xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
                  {row.map((post: any, colIndex: number) => (
                    <article
                      key={post._id}
                      className={`p-6 sm:p-10 flex flex-col justify-between gap-6 ${
                        colIndex === 0 ? "md:dashed-border-r max-md:dashed-border-b" : ""
                      }`}
                    >
                      <div className="space-y-3">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          {formatDate(post.createdAt)}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-semibold text-foreground hover:text-primary transition-colors leading-snug">
                          <Link href={`/blogs/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <Avatar className="w-6 h-6 border border-border/60">
                          <AvatarImage
                            src={post.author?.image}
                            alt={post.author?.name}
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="text-[10px] font-medium">
                            {post.author?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground/80 font-medium">
                          {post.author?.name}
                        </span>
                      </div>
                    </article>
                  ))}
                  {row.length === 1 && (
                    <div className="hidden md:block" />
                  )}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}


