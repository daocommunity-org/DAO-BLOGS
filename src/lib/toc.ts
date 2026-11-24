export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/** Runs on sanitized HTML. Heading IDs stay unique across article parts. */
export function extractHeadingsAndInjectIds(html: string, usedIds = new Set<string>()) {
  const headings: TocHeading[] = [];
  const headingPattern = /<(h[23])(\s+[^>]*)?>([\s\S]*?)<\/\1>/gi;
  const idPattern = /\s+id="([^"]*)"/i;
  const modifiedHtml = html.replace(headingPattern, (match, tag: string, attrs = "", content: string) => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;

    const existingId = attrs.match(idPattern)?.[1];
    const generatedId = text.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const baseId = existingId || generatedId || "section";
    let id = baseId;
    let suffix = 1;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    headings.push({ id, text, level: Number(tag[1]) });
    return `<${tag}${attrs.replace(idPattern, "")} id="${id}">${content}</${tag}>`;
  });
  return { headings, modifiedHtml };
}
