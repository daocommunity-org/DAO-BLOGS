import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Heart } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

export interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    tags: string[];
    author: {
      name: string;
      image?: string;
    };
    likesCount: number;
    commentsCount: number;
    createdAt: string | Date;
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden border border-border bg-card flex flex-col justify-between">
      <div>
        {blog.coverImage && (
          <div className="relative w-full h-44 overflow-hidden bg-muted">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        )}

        <CardContent className="p-5 flex flex-col gap-3">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {blog.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground leading-snug line-clamp-2">
              <Link href={`/blogs/${blog.slug}`} className="hover:text-primary transition-colors">
                {blog.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>
          </div>
        </CardContent>
      </div>

      <div className="px-5 pb-4">
        <Separator className="mb-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={blog.author.image} alt={blog.author.name} referrerPolicy="no-referrer" />
              <AvatarFallback className="text-[10px]">
                {blog.author.name?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground/70 font-medium">{blog.author.name}</span>
            <span>·</span>
            <time>{formattedDate}</time>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              {blog.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              {blog.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

