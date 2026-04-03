const entityMap: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&nbsp;": " "
};

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (match) => entityMap[match] ?? match);
}

export function stripHtml(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function looksLikeHtml(input: string): boolean {
  return /<([a-z][a-z0-9-]*)\b[^>]*>/i.test(input);
}

export function matchAllGroups(input: string, regex: RegExp): string[] {
  const results: string[] = [];
  for (const match of input.matchAll(regex)) {
    const group = match[1];
    if (group) {
      results.push(decodeHtmlEntities(group.trim()));
    }
  }

  return results.filter(Boolean);
}

export function extractAttribute(html: string, attribute: string): string | undefined {
  const regex = new RegExp(`${attribute}=["']([^"']+)["']`, "i");
  const match = html.match(regex);
  return match?.[1];
}

export function extractImageDescriptors(html: string): Array<{ url: string; alt?: string }> {
  const results: Array<{ url: string; alt?: string }> = [];
  const regex = /<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(regex)) {
    const tag = match[0];
    const url = match[1];
    if (!url) {
      continue;
    }

    const alt = extractAttribute(tag, "alt");
    results.push(alt ? { url, alt } : { url });
  }

  return results;
}
