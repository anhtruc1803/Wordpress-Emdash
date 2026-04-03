import type {
  FallbackBlock,
  StructuredNode,
  TransformWarning,
  UnsupportedNode
} from "@wp2emdash/shared-types";

import type { GutenbergBlock } from "../parsers/gutenberg.js";

import {
  extractImageDescriptors,
  matchAllGroups,
  stripHtml
} from "../utils/html.js";
import { detectRiskyContent } from "./shortcodes.js";

export const SUPPORTED_BLOCKS = new Set([
  "core/paragraph",
  "core/heading",
  "core/list",
  "core/quote",
  "core/image",
  "core/gallery",
  "core/embed",
  "core/code",
  "core/preformatted",
  "core/separator",
  "core/table",
  "core/html"
]);

export const PASSTHROUGH_BLOCKS = new Set(["core/group", "core/columns", "core/column"]);

export function isSupportedBlock(blockName: string): boolean {
  return SUPPORTED_BLOCKS.has(blockName) || PASSTHROUGH_BLOCKS.has(blockName);
}

export interface BlockTransformContext {
  warnings: TransformWarning[];
  unsupportedNodes: UnsupportedNode[];
  fallbackBlocks: FallbackBlock[];
}

function addWarning(context: BlockTransformContext, warning: TransformWarning): void {
  context.warnings.push(warning);
}

function addUnsupported(context: BlockTransformContext, blockName: string, rawPayload: string, reason: string): StructuredNode[] {
  context.unsupportedNodes.push({
    blockName,
    rawPayload,
    reason
  });
  context.fallbackBlocks.push({
    blockName,
    label: blockName.split("/").at(-1) ?? blockName,
    rawPayload
  });
  addWarning(context, {
    code: blockName.includes("/") ? "UNSUPPORTED_BLOCK" : "UNKNOWN_BLOCK",
    message: `Block ${blockName} requires manual review.`,
    severity: "warning"
  });

  return [
    {
      kind: "fallback",
      label: blockName.split("/").at(-1) ?? blockName,
      blockName,
      rawPayload
    }
  ];
}

function transformTable(html: string): StructuredNode {
  const rowMatches = Array.from(html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi));
  const rows = rowMatches.map((rowMatch) => {
    const cells = Array.from((rowMatch[1] ?? "").matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/(td|th)>/gi));
    return cells.map((cell) => stripHtml(cell[2] ?? ""));
  });

  return {
    kind: "table",
    rows
  };
}

export function transformBlock(block: GutenbergBlock, context: BlockTransformContext): StructuredNode[] {
  if (!block.blockName) {
    if (block.innerBlocks.length > 0) {
      return block.innerBlocks.flatMap((child) => transformBlock(child, context));
    }

    const plainText = stripHtml(block.innerHTML);
    if (plainText) {
      return [{ kind: "paragraph", text: plainText }];
    }

    return [];
  }

  if (PASSTHROUGH_BLOCKS.has(block.blockName)) {
    return block.innerBlocks.flatMap((child) => transformBlock(child, context));
  }

  switch (block.blockName) {
    case "core/paragraph":
      return [{ kind: "paragraph", text: stripHtml(block.innerHTML) }];
    case "core/heading":
      return [
        {
          kind: "heading",
          level: typeof block.attrs?.level === "number" ? block.attrs.level : 2,
          text: stripHtml(block.innerHTML)
        }
      ];
    case "core/list":
      return [
        {
          kind: "list",
          ordered: /<ol\b/i.test(block.innerHTML),
          items: matchAllGroups(block.innerHTML, /<li\b[^>]*>([\s\S]*?)<\/li>/gi)
        }
      ];
    case "core/quote":
      return [
        {
          kind: "quote",
          text: stripHtml(block.innerHTML)
        }
      ];
    case "core/image": {
      const firstImage = extractImageDescriptors(block.innerHTML)[0];
      const url =
        typeof block.attrs?.url === "string"
          ? block.attrs.url
          : firstImage?.url ?? "";
      const alt =
        typeof block.attrs?.alt === "string"
          ? block.attrs.alt
          : firstImage?.alt;
      return [
        {
          kind: "image",
          url,
          alt,
          caption: matchAllGroups(block.innerHTML, /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi)[0],
          mediaId: typeof block.attrs?.id === "number" ? String(block.attrs.id) : undefined
        }
      ];
    }
    case "core/gallery":
      return [
        {
          kind: "gallery",
          images: extractImageDescriptors(block.innerHTML).map((image) => ({
            url: image.url,
            alt: image.alt
          }))
        }
      ];
    case "core/embed":
      addWarning(context, {
        code: "EMBED_FOUND",
        message: "Embedded content detected and should be reviewed.",
        severity: "warning"
      });
      return [
        {
          kind: "embed",
          url: typeof block.attrs?.url === "string" ? block.attrs.url : undefined,
          provider: typeof block.attrs?.providerNameSlug === "string" ? block.attrs.providerNameSlug : undefined,
          html: block.innerHTML || undefined
        }
      ];
    case "core/code":
    case "core/preformatted":
      return [
        {
          kind: "code",
          code: stripHtml(block.innerHTML),
          language: typeof block.attrs?.language === "string" ? block.attrs.language : undefined
        }
      ];
    case "core/separator":
      return [{ kind: "separator" }];
    case "core/table":
      return [transformTable(block.innerHTML)];
    case "core/html": {
      addWarning(context, {
        code: "RAW_HTML_BLOCK",
        message: "Raw HTML block detected and preserved as HTML.",
        severity: "warning"
      });

      const riskySignals = detectRiskyContent(block.innerHTML);
      if (riskySignals.hasScript) {
        addWarning(context, {
          code: "SCRIPT_FOUND",
          message: "Script fragment detected inside a raw HTML block.",
          severity: "error"
        });
      }

      if (riskySignals.hasEmbed) {
        addWarning(context, {
          code: "EMBED_FOUND",
          message: "Embedded HTML detected inside a raw HTML block.",
          severity: "warning"
        });
      }

      return [{ kind: "html", rawHtml: block.innerHTML.trim() }];
    }
    default:
      return addUnsupported(context, block.blockName, block.innerHTML || JSON.stringify(block.attrs ?? {}), "Unsupported Gutenberg block");
  }
}
