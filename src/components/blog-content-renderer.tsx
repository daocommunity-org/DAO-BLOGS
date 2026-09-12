"use client";

import React from "react";
import DOMPurify from "dompurify";
import { MermaidViewer } from "./mermaid-viewer";

interface BlogContentRendererProps {
  content: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Return raw HTML during SSR; full DOMPurify sanitization runs once hydrated in the browser
    return html;
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

  return html;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // Extract mermaid blocks:
  // Match either:
  // 1) <div class="mermaid">...</div> (recommended)
  // 2) <pre class="mermaid">...</pre>
  // 3) ```mermaid ... ```
  const parts: { type: "html" | "mermaid"; data: string }[] = [];

  const regex =
    /(?:<(?:div|pre)\s+class=["'](?:language-)?mermaid["']>([\s\S]*?)<\/(?:div|pre)>)|(?:```mermaid\n([\s\S]*?)```)/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    // Push HTML preceding the match
    if (start > lastIndex) {
      parts.push({
        type: "html",
        data: content.substring(lastIndex, start),
      });
    }

    const rawCode = match[1] ?? match[2] ?? "";
    const mermaidCode = decodeHtmlEntities(rawCode).trim();
    parts.push({
      type: "mermaid",
      data: mermaidCode,
    });

    lastIndex = end;
  }

  // Push remaining HTML
  if (lastIndex < content.length) {
    parts.push({
      type: "html",
      data: content.substring(lastIndex),
    });
  }

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
