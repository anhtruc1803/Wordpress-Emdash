import type { StructuredNode } from "@wp2emdash/shared-types";

import { extractImageDescriptors, stripHtml } from "../utils/html.js";

export interface PortableTextSpan {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
}

export interface PortableTextBlock {
  _key: string;
  _type: "block";
  style: "normal" | "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: PortableTextSpan[];
  markDefs: unknown[];
  listItem?: "bullet" | "number";
  level?: number;
}

export interface PortableTextCodeBlock {
  _key: string;
  _type: "code";
  code: string;
  language?: string;
}

export type PortableTextNode = PortableTextBlock | PortableTextCodeBlock;

export interface PortableTextConversionResult {
  portableText: PortableTextNode[];
  unsupportedNodes: StructuredNode[];
}

export function convertStructuredNodesToPortableText(
  nodes: StructuredNode[]
): PortableTextConversionResult {
  const portableText: PortableTextNode[] = [];
  const unsupportedNodes: StructuredNode[] = [];

  for (const node of nodes) {
    switch (node.kind) {
      case "paragraph":
        portableText.push(createTextBlock("normal", node.text));
        break;
      case "heading":
        portableText.push(createTextBlock(toHeadingStyle(node.level), node.text));
        break;
      case "list":
        portableText.push(
          ...node.items.map((item, index) =>
            createTextBlock("normal", item, {
              listItem: node.ordered ? "number" : "bullet",
              level: 1,
              suffix: `${index}`
            })
          )
        );
        break;
      case "quote":
        portableText.push(createTextBlock("blockquote", node.text));
        break;
      case "code":
        portableText.push({
          _key: createKey("code"),
          _type: "code",
          code: node.code,
          ...(node.language ? { language: node.language } : {})
        });
        break;
      case "separator":
        portableText.push(createTextBlock("normal", "---"));
        break;
      case "image":
        portableText.push(
          createTextBlock(
            "normal",
            [node.alt, node.caption, node.url].filter(Boolean).join(" - ") || node.url
          )
        );
        break;
      case "gallery":
        portableText.push(
          ...node.images
            .filter((image) => Boolean(image.url))
            .map((image, index) =>
              createTextBlock("normal", [image.alt, image.url].filter(Boolean).join(" - "), {
                suffix: `gallery-${index}`
              })
            )
        );
        break;
      case "embed":
        portableText.push(
          createTextBlock(
            "normal",
            [node.provider ? `Embed ${node.provider}` : "Embedded media", node.url ?? stripHtml(node.html ?? "")]
              .filter(Boolean)
              .join(": ")
          )
        );
        break;
      case "table":
        portableText.push(
          ...node.rows.map((row, index) =>
            createTextBlock("normal", row.join(" | "), {
              suffix: `table-${index}`
            })
          )
        );
        break;
      case "html":
        portableText.push(...htmlToBlocks(node.rawHtml));
        break;
      case "fallback":
        portableText.push(
          createTextBlock(
            "normal",
            `[Unsupported block: ${node.label}] ${stripHtml(node.rawPayload)}`
          )
        );
        break;
      default:
        unsupportedNodes.push(node);
        break;
    }
  }

  return {
    portableText,
    unsupportedNodes
  };
}

function createTextBlock(
  style: PortableTextBlock["style"],
  text: string,
  options?: Pick<PortableTextBlock, "listItem" | "level"> & { suffix?: string }
): PortableTextBlock {
  const normalizedText = text.trim().length ? text : " ";
  const keySuffix = options?.suffix ? `-${options.suffix}` : "";

  return {
    _key: createKey(`block${keySuffix}`),
    _type: "block",
    style,
    children: [
      {
        _key: createKey(`span${keySuffix}`),
        _type: "span",
        marks: [],
        text: normalizedText
      }
    ],
    markDefs: [],
    ...(options?.listItem ? { listItem: options.listItem } : {}),
    ...(options?.level ? { level: options.level } : {})
  };
}

function toHeadingStyle(level: number): PortableTextBlock["style"] {
  const normalized = Math.min(Math.max(level, 1), 6);
  return `h${normalized}` as PortableTextBlock["style"];
}

function createKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function htmlToBlocks(rawHtml: string): PortableTextBlock[] {
  const imageBlocks = extractImageDescriptors(rawHtml)
    .filter((image) => Boolean(image.url))
    .map((image, index) =>
      createTextBlock("normal", [image.alt, image.url].filter(Boolean).join(" - "), {
        suffix: `html-image-${index}`
      })
    );

  const textContent = rawHtml
    .replace(/<(br|\/p|\/div|\/section|\/article|\/li|\/h[1-6])\b[^>]*>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>|<\/th>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .map((line) => stripHtml(line))
    .filter(Boolean)
    .map((line, index) =>
      createTextBlock("normal", line, {
        suffix: `html-${index}`
      })
    );

  return [...textContent, ...imageBlocks];
}
