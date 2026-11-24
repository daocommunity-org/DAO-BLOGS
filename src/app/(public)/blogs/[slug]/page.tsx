import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticlePage } from "@/features/blogs/article-page";
import { getPublishedPost } from "@/features/blogs/published-post";

export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

type BlogPostPageProps = PageProps<"/blogs/[slug]">;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedPost(slug);
  if (!blog) notFound();
  return { title: `${blog.title} - DAO Blogs`, description: blog.excerpt };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getPublishedPost(slug);
  if (!blog) notFound();
  return <ArticlePage blog={{ ...blog, _id: String(blog._id) }} />;
}
