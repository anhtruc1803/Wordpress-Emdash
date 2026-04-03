import type { ShortcodeOccurrence } from "@wp2emdash/shared-types";

export function detectShortcodes(rawContent: string): ShortcodeOccurrence[] {
  const results: ShortcodeOccurrence[] = [];
  const regex = /\[(\/?)([a-zA-Z0-9_-]+)([^\]]*)\]/g;

  for (const match of rawContent.matchAll(regex)) {
    const raw = match[0];
    const closingMarker = match[1];
    const shortcodeName = match[2];

    if (!raw || !shortcodeName || closingMarker === "/") {
      continue;
    }

    results.push({
      name: shortcodeName,
      raw
    });
  }

  return results;
}

export interface RiskyContentSignals {
  hasIframe: boolean;
  hasScript: boolean;
  hasEmbed: boolean;
}

export function detectRiskyContent(rawContent: string): RiskyContentSignals {
  return {
    hasIframe: /<iframe\b/i.test(rawContent),
    hasScript: /<script\b/i.test(rawContent),
    hasEmbed: /<(iframe|embed|object)\b/i.test(rawContent)
  };
}
