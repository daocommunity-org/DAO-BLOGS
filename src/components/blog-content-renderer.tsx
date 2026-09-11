"use client";

import React from "react";
import { MermaidViewer } from "./mermaid-viewer";

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // Extract mermaid blocks:
  // Match either:
  // 1) <pre class="mermaid">...</pre>
  // 2) ```mermaid ... ```
  const parts: { type: "html" | "mermaid"; data: string }[] = [];

  const regex =
    /(?:<pre\s+class=["'](?:language-)?mermaid["']>([\s\S]*?)<\/pre>)|(?:```mermaid\n([\s\S]*?)```)/gi;

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

    const mermaidCode = (match[1] || match[2] || "").trim();
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
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: part.data }}
            className="prose-container"
          />
        );
      })}
    </div>
  );
}
