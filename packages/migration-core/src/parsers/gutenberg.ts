import { parse } from "@wordpress/block-serialization-default-parser";

export interface GutenbergBlock {
  blockName: string | null;
  attrs?: Record<string, unknown>;
  innerBlocks: GutenbergBlock[];
  innerHTML: string;
}

export function parseGutenbergDocument(rawContent: string): GutenbergBlock[] {
  if (!rawContent.trim()) {
    return [];
  }

  return parse(rawContent) as GutenbergBlock[];
}

export function flattenBlockNames(blocks: GutenbergBlock[]): string[] {
  const names: string[] = [];

  for (const block of blocks) {
    if (block.blockName) {
      names.push(block.blockName);
    }

    if (block.innerBlocks.length > 0) {
      names.push(...flattenBlockNames(block.innerBlocks));
    }
  }

  return names;
}
