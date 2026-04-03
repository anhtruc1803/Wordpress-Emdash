import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  AuditResult,
  GeneratedArtifacts,
  ImportPlan,
  PipelineArtifactsSummary,
  TransformResult
} from "@wp2emdash/shared-types";

import { renderMigrationReport } from "../reporters/markdown-report.js";
import { renderManualFixesCsv } from "../reporters/manual-fixes-csv.js";
import { ensureDirectory, writeJsonFile } from "../utils/filesystem.js";

export interface WriteArtifactsInput {
  outputDir: string;
  auditResult: AuditResult;
  totalItems: number;
  transformResults?: TransformResult[];
  importPlan?: ImportPlan;
}

export async function writeArtifacts(input: WriteArtifactsInput): Promise<PipelineArtifactsSummary> {
  await ensureDirectory(input.outputDir);

  const artifacts: GeneratedArtifacts = {
    outputDir: input.outputDir,
    auditResultPath: join(input.outputDir, "audit-result.json"),
    migrationReportPath: join(input.outputDir, "migration-report.md"),
    summaryPath: join(input.outputDir, "summary.json")
  };

  await writeJsonFile(artifacts.auditResultPath, input.auditResult);
  await writeFile(artifacts.migrationReportPath, renderMigrationReport(input.auditResult, input.importPlan), "utf8");

  if (input.transformResults) {
    artifacts.transformPreviewPath = join(input.outputDir, "transform-preview.json");
    await writeJsonFile(artifacts.transformPreviewPath, input.transformResults);
  }

  if (input.importPlan) {
    artifacts.importPlanPath = join(input.outputDir, "import-plan.json");
    artifacts.manualFixesCsvPath = join(input.outputDir, "manual-fixes.csv");
    await writeJsonFile(artifacts.importPlanPath, input.importPlan);
    await writeFile(artifacts.manualFixesCsvPath, renderManualFixesCsv(input.importPlan.manualFixes), "utf8");
  }

  const summary: PipelineArtifactsSummary = {
    source: input.auditResult.source,
    totalItems: input.totalItems,
    transformedItems: input.transformResults?.length ?? 0,
    unresolvedItems: input.importPlan?.unresolvedItems.length ?? input.auditResult.unsupportedItems.length,
    recommendation: input.auditResult.recommendation,
    difficulty: input.auditResult.difficulty,
    outputs: artifacts
  };

  await writeJsonFile(artifacts.summaryPath, summary);
  return summary;
}
