import type { DifficultyScore, MigrationRecommendation } from "@wp2emdash/shared-types";

export interface DifficultyInput {
  unsupportedBlockCount: number;
  unsupportedItemCount: number;
  shortcodeCount: number;
  builderHintCount: number;
  rawHtmlCount: number;
  embedCount: number;
  scriptCount: number;
  customPostTypeCount: number;
}

export function computeDifficulty(input: DifficultyInput): DifficultyScore {
  let score = 0;
  const reasons: string[] = [];

  if (input.unsupportedBlockCount > 0) {
    score += Math.min(30, input.unsupportedBlockCount * 5);
    reasons.push(`${input.unsupportedBlockCount} unsupported block(s) need fallback handling.`);
  }

  if (input.shortcodeCount > 0) {
    score += Math.min(20, input.shortcodeCount * 4);
    reasons.push(`${input.shortcodeCount} shortcode occurrence(s) require manual review.`);
  }

  if (input.builderHintCount > 0) {
    score += Math.min(20, input.builderHintCount * 10);
    reasons.push(`Builder/plugin heuristics detected ${input.builderHintCount} migration-sensitive system(s).`);
  }

  if (input.rawHtmlCount > 0) {
    score += Math.min(18, input.rawHtmlCount * 6);
    reasons.push(`${input.rawHtmlCount} raw HTML block(s) were preserved instead of fully converted.`);
  }

  if (input.embedCount > 0) {
    score += Math.min(12, input.embedCount * 4);
    reasons.push(`${input.embedCount} embed/iframe instance(s) may need target-specific handling.`);
  }

  if (input.scriptCount > 0) {
    score += Math.min(20, input.scriptCount * 10);
    reasons.push(`${input.scriptCount} script fragment(s) are considered high risk.`);
  }

  if (input.customPostTypeCount > 0) {
    score += Math.min(16, input.customPostTypeCount * 8);
    reasons.push(`${input.customPostTypeCount} custom post type(s) need collection mapping decisions.`);
  }

  if (input.unsupportedItemCount > 0 && input.unsupportedBlockCount === 0 && input.shortcodeCount === 0) {
    score += 8;
    reasons.push(`${input.unsupportedItemCount} item(s) still contain migration warnings.`);
  }

  const level: DifficultyScore["level"] = score >= 60 ? "High" : score >= 25 ? "Medium" : "Low";

  return {
    level,
    score,
    reasons
  };
}

export function recommendMigration(difficulty: DifficultyScore, unresolvedCount: number): MigrationRecommendation {
  if (difficulty.level === "High") {
    return "rebuild recommended";
  }

  if (difficulty.level === "Medium" || unresolvedCount > 0) {
    return "import with manual cleanup";
  }

  return "ready for import";
}
