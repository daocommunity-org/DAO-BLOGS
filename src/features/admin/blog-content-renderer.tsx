"use client";

import DOMPurify from "dompurify";
import { MermaidViewer } from "@/features/blogs/mermaid-viewer";
import { splitArticleContent } from "@/features/blogs/split-article-content";

interface BlogContentRendererProps {
  content: string;
}

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    if (typeof DOMPurify?.sanitize === "function") {
      return DOMPurify.sanitize(html, {
        ADD_ATTR: ["id", "target", "rel", "referrerpolicy"],
      });
    }

    if (typeof DOMPurify === "function") {
      const purifier = (DOMPurify as unknown as (root: Window) => typeof DOMPurify)(window);
      if (purifier && typeof purifier.sanitize === "function") {
        return purifier.sanitize(html, {
          ADD_ATTR: ["id", "target", "rel", "referrerpolicy"],
        });
      }
    }
  } catch (err) {
    console.error("DOMPurify sanitization error:", err);
  }

  return "";
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  const parts = splitArticleContent(content);

  return (
    <div className="blog-content leading-relaxed text-foreground space-y-4">
      {parts.map((part, index) => {
        if (part.type === "mermaid") {
          return <MermaidViewer key={index} chart={part.data} />;
        }
        const cleanHtml = sanitizeHtml(part.data);
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            className="prose-container"
            suppressHydrationWarning
          />
        );
      })}
    </div>
  );
}
