import type {
  AuditIssue,
  AuditResult,
  BuilderOrPluginHint,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { flattenBlockNames, parseGutenbergDocument } from "../parsers/gutenberg.js";
import { incrementCounter } from "../utils/collections.js";
import { isSupportedBlock } from "../transformers/block-transformers.js";
import { detectRiskyContent, detectShortcodes } from "../transformers/shortcodes.js";
import { computeDifficulty, recommendMigration } from "./difficulty.js";
import { detectBuilderAndPluginHints } from "./heuristics.js";

function pushIssue(issues: AuditIssue[], issue: AuditIssue): void {
  issues.push(issue);
}

export function auditWordPressSource(bundle: WordPressSourceBundle): AuditResult {
  const contentCounts: Record<string, number> = {};
  const blockCounts: Record<string, number> = {};
  const shortcodeCounts: Record<string, number> = {};
  const unsupportedItems: AuditIssue[] = [];
  const hintMap = new Map<string, BuilderOrPluginHint>();

  let unsupportedBlockCount = 0;
  let rawHtmlCount = 0;
  let embedCount = 0;
  let scriptCount = 0;

  for (const item of bundle.contentItems) {
    incrementCounter(contentCounts, item.type);

    const blocks = parseGutenbergDocument(item.rawContent);
    const blockNames = flattenBlockNames(blocks);
    if (blockNames.length === 0 && item.rawContent.trim()) {
      incrementCounter(blockCounts, "legacy/raw-html");
      rawHtmlCount += 1;
      pushIssue(unsupportedItems, {
        itemId: item.id,
        itemType: item.type,
        severity: "warning",
        reason: "legacy-html",
        detail: "Content has no Gutenberg block structure and will be preserved as HTML."
      });
    }

    for (const blockName of blockNames) {
      incrementCounter(blockCounts, blockName);
      if (!isSupportedBlock(blockName)) {
        unsupportedBlockCount += 1;
        pushIssue(unsupportedItems, {
          itemId: item.id,
          itemType: item.type,
          severity: "warning",
          reason: "unsupported-block",
          detail: `Unsupported block detected: ${blockName}`
        });
      }

      if (blockName === "core/html") {
        rawHtmlCount += 1;
      }

      if (blockName === "core/embed") {
        embedCount += 1;
      }
    }

    const shortcodes = detectShortcodes(item.rawContent);
    for (const shortcode of shortcodes) {
      incrementCounter(shortcodeCounts, shortcode.name);
      pushIssue(unsupportedItems, {
        itemId: item.id,
        itemType: item.type,
        severity: "warning",
        reason: "shortcode",
        detail: `Shortcode preserved for manual migration: ${shortcode.raw}`
      });
    }

    const riskySignals = detectRiskyContent(item.rawContent);
    if (riskySignals.hasEmbed) {
      embedCount += 1;
      pushIssue(unsupportedItems, {
        itemId: item.id,
        itemType: item.type,
        severity: "warning",
        reason: "embed",
        detail: "iframe/embed usage detected."
      });
    }

    if (riskySignals.hasScript) {
      scriptCount += 1;
      pushIssue(unsupportedItems, {
        itemId: item.id,
        itemType: item.type,
        severity: "error",
        reason: "script",
        detail: "Script fragments detected and must be manually rebuilt."
      });
    }

    for (const hint of detectBuilderAndPluginHints(item, shortcodes, blockNames)) {
      const key = `${hint.kind}:${hint.name}`;
      const existing = hintMap.get(key);
      if (!existing) {
        hintMap.set(key, hint);
        continue;
      }

      hintMap.set(key, {
        ...existing,
        evidence: Array.from(new Set([...existing.evidence, ...hint.evidence])).slice(0, 5)
      });
    }
  }

  incrementCounter(contentCounts, "attachment", bundle.media.length);

  const allHints = Array.from(hintMap.values());
  const difficulty = computeDifficulty({
    unsupportedBlockCount,
    unsupportedItemCount: unsupportedItems.length,
    shortcodeCount: Object.values(shortcodeCounts).reduce((sum, count) => sum + count, 0),
    builderHintCount: allHints.length,
    rawHtmlCount,
    embedCount,
    scriptCount,
    customPostTypeCount: bundle.customPostTypes.length
  });

  return {
    generatedAt: new Date().toISOString(),
    source: bundle.site,
    contentCounts,
    blockInventory: Object.entries(blockCounts)
      .map(([blockName, count]) => ({
        blockName,
        count,
        supported: isSupportedBlock(blockName)
      }))
      .sort((left, right) => right.count - left.count || left.blockName.localeCompare(right.blockName)),
    shortcodeInventory: Object.entries(shortcodeCounts)
      .map(([shortcode, count]) => ({ shortcode, count }))
      .sort((left, right) => right.count - left.count || left.shortcode.localeCompare(right.shortcode)),
    builderHints: allHints.filter((hint) => hint.kind === "builder"),
    pluginHints: allHints.filter((hint) => hint.kind === "plugin"),
    customPostTypeFindings: bundle.customPostTypes,
    unsupportedItems,
    difficulty,
    recommendation: recommendMigration(difficulty, unsupportedItems.length)
  };
}
