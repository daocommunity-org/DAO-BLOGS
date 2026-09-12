export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Parses HTML content, extracts H2 and H3 headings,
 * and ensures each heading tag has a unique id anchor.
 */
export function extractHeadingsAndInjectIds(html: string): {
  headings: TocHeading[];
  modifiedHtml: string;
} {
  const headings: TocHeading[] = [];
  const slugCounts = new Map<string, number>();

  const headingRegex = /<(h[23])(\s+[^>]*)?>([\s\S]*?)<\/\1>/gi;

  const modifiedHtml = html.replace(
    headingRegex,
    (fullMatch, tag: string, existingAttrs: string = '', innerContent: string) => {
      const level = tag.toLowerCase() === 'h2' ? 2 : 3;

      // Extract raw plain text without nested tags
      const text = innerContent.replace(/<[^>]+>/g, '').trim();
      if (!text) return fullMatch;

      // Check if tag already has an id attribute
      const idMatch = existingAttrs.match(/\bid=["']([^"']+)["']/i);
      let id = idMatch ? idMatch[1] : '';

      if (!id) {
        const baseSlug =
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';

        const count = slugCounts.get(baseSlug) || 0;
        slugCounts.set(baseSlug, count + 1);
        id = count === 0 ? baseSlug : baseSlug + '-' + count;

        // Return heading with injected id
        headings.push({ id, text, level });
        return '<' + tag + existingAttrs + ' id="' + id + '">' + innerContent + '</' + tag + '>';
      } else {
        headings.push({ id, text, level });
        return fullMatch;
      }
    }
  );

  return { headings, modifiedHtml };
}
