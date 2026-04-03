import type { AuditResult, ImportPlan } from "@wp2emdash/shared-types";

function renderCountTable(entries: Array<[string, number]>): string {
  if (entries.length === 0) {
    return "_Không có dữ liệu._";
  }

  return [
    "| Loại | Số lượng |",
    "| --- | ---: |",
    ...entries.map(([label, count]) => `| ${label} | ${count} |`)
  ].join("\n");
}

export function renderMigrationReport(audit: AuditResult, plan?: ImportPlan): string {
  const lines: string[] = [];

  lines.push("# Migration Report");
  lines.push("");
  lines.push(`- Site: ${audit.source.name}`);
  lines.push(`- URL: ${audit.source.url}`);
  lines.push(`- Source kind: ${audit.source.sourceKind}`);
  lines.push(`- Generated at: ${audit.generatedAt}`);
  lines.push(`- Difficulty: ${audit.difficulty.level} (${audit.difficulty.score})`);
  lines.push(`- Recommendation: ${audit.recommendation}`);
  lines.push("");
  lines.push("## Content Inventory");
  lines.push("");
  lines.push(renderCountTable(Object.entries(audit.contentCounts)));
  lines.push("");
  lines.push("## Gutenberg Block Inventory");
  lines.push("");
  lines.push(renderCountTable(audit.blockInventory.map((entry) => [`${entry.blockName} (${entry.supported ? "supported" : "unsupported"})`, entry.count])));
  lines.push("");
  lines.push("## Shortcodes");
  lines.push("");
  lines.push(
    audit.shortcodeInventory.length > 0
      ? renderCountTable(audit.shortcodeInventory.map((entry) => [entry.shortcode, entry.count]))
      : "_Không phát hiện shortcode._"
  );
  lines.push("");
  lines.push("## Builder / Plugin Hints");
  lines.push("");
  if (audit.builderHints.length === 0 && audit.pluginHints.length === 0) {
    lines.push("_Không phát hiện builder/plugin đặc biệt._");
  } else {
    for (const hint of [...audit.builderHints, ...audit.pluginHints]) {
      lines.push(`- ${hint.kind}: ${hint.name} (${hint.confidence})`);
    }
  }
  lines.push("");
  lines.push("## Difficulty Drivers");
  lines.push("");
  if (audit.difficulty.reasons.length === 0) {
    lines.push("_Không có tín hiệu rủi ro đáng kể._");
  } else {
    for (const reason of audit.difficulty.reasons) {
      lines.push(`- ${reason}`);
    }
  }
  lines.push("");
  lines.push("## Unsupported / Risky Items");
  lines.push("");
  if (audit.unsupportedItems.length === 0) {
    lines.push("_Không có item rủi ro._");
  } else {
    for (const issue of audit.unsupportedItems.slice(0, 25)) {
      lines.push(`- [${issue.severity}] ${issue.itemType}#${issue.itemId}: ${issue.detail}`);
    }
  }

  if (plan) {
    lines.push("");
    lines.push("## Import Planning Summary");
    lines.push("");
    lines.push(`- Collections: ${plan.collections.length}`);
    lines.push(`- Entries to create: ${plan.entriesToCreate.length}`);
    lines.push(`- Media to import: ${plan.mediaToImport.length}`);
    lines.push(`- Unresolved items: ${plan.unresolvedItems.length}`);
    lines.push(`- Manual fixes: ${plan.manualFixes.length}`);
  }

  return `${lines.join("\n")}\n`;
}
