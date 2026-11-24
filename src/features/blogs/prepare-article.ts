import "server-only";

import sanitizeHtml from "sanitize-html";
import { extractHeadingsAndInjectIds, type TocHeading } from "@/lib/toc";
import { splitArticleContent } from "./split-article-content";

export function prepareArticle(content: string) {
  const safeHtml = sanitizeHtml(content, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "details", "summary", "figure", "figcaption", "mark", "kbd", "samp", "sup", "sub"],
    allowedAttributes: {
      "*": ["id", "class", "title", "aria-label"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding", "referrerpolicy"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();
  const parts = splitArticleContent(safeHtml).map((part) => {
    if (part.type === "mermaid") return part;
    const { headings: partHeadings, modifiedHtml } = extractHeadingsAndInjectIds(part.data, usedIds);
    headings.push(...partHeadings);
    return { ...part, data: modifiedHtml };
  });
  return { headings, parts };
}
