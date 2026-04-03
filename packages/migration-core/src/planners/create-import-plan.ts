import { basename } from "node:path";

import type {
  ImportPlan,
  ManualFixRecord,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { mapSourceTypeToCollection } from "../mappers/collection-mapper.js";
import { incrementCounter } from "../utils/collections.js";

function mapManualFixes(transform: TransformResult): ManualFixRecord[] {
  const fixes: ManualFixRecord[] = [];

  for (const shortcode of transform.shortcodes) {
    fixes.push({
      sourceId: transform.itemId,
      sourceType: transform.sourceType,
      reason: "shortcode",
      detail: shortcode.raw
    });
  }

  for (const unsupported of transform.unsupportedNodes) {
    fixes.push({
      sourceId: transform.itemId,
      sourceType: transform.sourceType,
      reason: "unsupported-block",
      detail: `${unsupported.blockName}: ${unsupported.reason}`
    });
  }

  for (const warning of transform.warnings) {
    if (warning.severity === "warning" || warning.severity === "error") {
      fixes.push({
        sourceId: transform.itemId,
        sourceType: transform.sourceType,
        reason: warning.code,
        detail: warning.message
      });
    }
  }

  return fixes;
}

export function createImportPlan(
  bundle: WordPressSourceBundle,
  transforms: TransformResult[],
  target?: string
): ImportPlan {
  const transformByItemId = new Map(transforms.map((transform) => [transform.itemId, transform]));
  const collectionCounts: Record<string, number> = {};
  const entriesToCreate: ImportPlan["entriesToCreate"] = [];
  const unresolvedItems: ImportPlan["unresolvedItems"] = [];
  const manualFixes: ManualFixRecord[] = [];

  for (const item of bundle.contentItems) {
    const transform = transformByItemId.get(item.id);
    if (!transform) {
      unresolvedItems.push({
        sourceId: item.id,
        sourceType: item.type,
        severity: "error",
        reason: "No transform result generated for this item."
      });
      continue;
    }

    const targetCollection = mapSourceTypeToCollection(item.type);
    incrementCounter(collectionCounts, targetCollection);

    entriesToCreate.push({
      sourceId: item.id,
      sourceType: item.type,
      targetCollection,
      slug: item.slug,
      title: item.title,
      status: item.status,
      content: transform.structuredContent,
      authorId: item.authorId,
      taxonomyTermIds: item.taxonomyTermIds,
      warnings: transform.warnings.map((warning) => `${warning.code}: ${warning.message}`)
    });

    if (transform.warnings.length > 0 || transform.unsupportedNodes.length > 0) {
      unresolvedItems.push({
        sourceId: item.id,
        sourceType: item.type,
        severity: transform.warnings.some((warning) => warning.severity === "error") ? "error" : "warning",
        reason: "Manual review required due to warnings, unsupported blocks, or risky content."
      });
    }

    manualFixes.push(...mapManualFixes(transform));
  }

  return {
    generatedAt: new Date().toISOString(),
    target,
    collections: Object.entries(collectionCounts)
      .map(([targetCollection, count]) => ({
        sourceType: entriesToCreate.find((entry) => entry.targetCollection === targetCollection)?.sourceType ?? targetCollection,
        targetCollection,
        count
      }))
      .sort((left, right) => left.targetCollection.localeCompare(right.targetCollection)),
    entriesToCreate,
    mediaToImport: bundle.media.map((asset) => ({
      sourceId: asset.id,
      url: asset.sourceUrl,
      filename: basename(new URL(asset.sourceUrl).pathname),
      mimeType: asset.mimeType,
      altText: asset.altText
    })),
    rewriteSuggestions: bundle.contentItems
      .filter((item) => item.sourceUrl)
      .map((item) => ({
        sourceUrl: item.sourceUrl as string,
        suggestedTargetPath: item.type === "page" ? `/${item.slug}` : `/${mapSourceTypeToCollection(item.type)}/${item.slug}`
      })),
    unresolvedItems,
    manualFixes
  };
}
