import type { TransformResult, WordPressContentItem } from "@wp2emdash/shared-types";

import { parseGutenbergDocument } from "../parsers/gutenberg.js";
import { looksLikeHtml, stripHtml } from "../utils/html.js";
import { transformBlock } from "./block-transformers.js";
import { detectRiskyContent, detectShortcodes } from "./shortcodes.js";

export function transformContentItem(item: WordPressContentItem): TransformResult {
  const warnings: TransformResult["warnings"] = [];
  const unsupportedNodes: TransformResult["unsupportedNodes"] = [];
  const fallbackBlocks: TransformResult["fallbackBlocks"] = [];
  const shortcodes = detectShortcodes(item.rawContent);

  if (shortcodes.length > 0) {
    warnings.push({
      code: "SHORTCODE_FOUND",
      message: `${shortcodes.length} shortcode(s) detected and preserved for manual migration.`,
      severity: "warning"
    });
  }

  const riskySignals = detectRiskyContent(item.rawContent);
  if (riskySignals.hasIframe || riskySignals.hasEmbed) {
    warnings.push({
      code: "EMBED_FOUND",
      message: "iframe/embed usage detected in the source content.",
      severity: "warning"
    });
  }

  if (riskySignals.hasScript) {
    warnings.push({
      code: "SCRIPT_FOUND",
      message: "Script fragments detected in the source content.",
      severity: "error"
    });
  }

  const blocks = parseGutenbergDocument(item.rawContent);
  const structuredContent =
    blocks.length > 0
      ? blocks.flatMap((block) =>
          transformBlock(block, {
            warnings,
            unsupportedNodes,
            fallbackBlocks
          })
        )
      : [];

  if (blocks.length === 0 && item.rawContent.trim()) {
    if (looksLikeHtml(item.rawContent)) {
      warnings.push({
        code: "RAW_HTML_BLOCK",
        message: "Legacy HTML content preserved as a raw HTML node.",
        severity: "warning"
      });
      structuredContent.push({
        kind: "html",
        rawHtml: item.rawContent.trim()
      });
    } else {
      structuredContent.push({
        kind: "paragraph",
        text: stripHtml(item.rawContent)
      });
    }
  }

  if (structuredContent.length === 0) {
    warnings.push({
      code: "EMPTY_CONTENT",
      message: "No transformable content found for this item.",
      severity: "info"
    });
  }

  const embeddedAssetRefs = structuredContent.flatMap((node) => {
    if (node.kind === "image") {
      return node.url ? [node.url] : [];
    }

    if (node.kind === "gallery") {
      return node.images.map((image) => image.url);
    }

    return [];
  });

  return {
    itemId: item.id,
    sourceType: item.type,
    structuredContent,
    warnings,
    unsupportedNodes,
    fallbackBlocks,
    shortcodes,
    embeddedAssetRefs
  };
}

export function transformBundleItems(items: WordPressContentItem[]): TransformResult[] {
  return items.map(transformContentItem);
}
