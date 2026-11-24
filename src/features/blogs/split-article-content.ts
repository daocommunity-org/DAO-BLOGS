type ArticlePart = { type: "html" | "mermaid"; data: string };

export function splitArticleContent(content: string): ArticlePart[] {
  const parts: ArticlePart[] = [];
  const diagram = /(?:<(?:div|pre)\s+class=["'](?:language-)?mermaid["']>([\s\S]*?)<\/(?:div|pre)>)|(?:```mermaid\r?\n([\s\S]*?)```)/gi;
  let lastIndex = 0;

  for (const match of content.matchAll(diagram)) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", data: content.slice(lastIndex, match.index) });
    }

    const code = (match[1] ?? match[2] ?? "")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
    parts.push({ type: "mermaid", data: code.trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "html", data: content.slice(lastIndex) });
  }

  return parts;
}
