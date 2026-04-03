import type {
  AuditResult,
  LoadSourceOptions,
  PipelineArtifactsSummary,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { PlanningOnlyEmDashTargetAdapter } from "./adapters/emdash-target.js";
import { auditWordPressSource } from "./auditors/audit-source.js";
import { loadWordPressRestApi } from "./connectors/rest.js";
import { loadWxrFile } from "./connectors/wxr.js";
import { createImportPlan } from "./planners/create-import-plan.js";
import { writeArtifacts } from "./planners/write-artifacts.js";
import { renderMigrationReport } from "./reporters/markdown-report.js";
import { transformBundleItems } from "./transformers/structured-transform.js";

export interface PipelineExecutionResult {
  bundle: WordPressSourceBundle;
  auditResult: AuditResult;
  transformResults?: TransformResult[];
  summary: PipelineArtifactsSummary;
  adapterNote?: string;
}

export interface CommandOptions extends LoadSourceOptions {
  outputDir: string;
}

export interface ImportCommandOptions extends CommandOptions {
  target: string;
}

export async function loadSourceBundle(options: LoadSourceOptions): Promise<WordPressSourceBundle> {
  if (options.sourceKind === "wxr") {
    return loadWxrFile(options.input);
  }

  return loadWordPressRestApi(options.input);
}

export async function executeAudit(options: CommandOptions): Promise<PipelineExecutionResult> {
  const bundle = await loadSourceBundle(options);
  const auditResult = auditWordPressSource(bundle);
  const summary = await writeArtifacts({
    outputDir: options.outputDir,
    auditResult,
    totalItems: bundle.contentItems.length
  });

  return {
    bundle,
    auditResult,
    summary
  };
}

export async function executeDryRun(options: CommandOptions): Promise<PipelineExecutionResult> {
  const bundle = await loadSourceBundle(options);
  const auditResult = auditWordPressSource(bundle);
  const transformResults = transformBundleItems(bundle.contentItems);
  const importPlan = createImportPlan(bundle, transformResults);
  const summary = await writeArtifacts({
    outputDir: options.outputDir,
    auditResult,
    transformResults,
    importPlan,
    totalItems: bundle.contentItems.length
  });

  return {
    bundle,
    auditResult,
    transformResults,
    summary
  };
}

export async function executeImport(options: ImportCommandOptions): Promise<PipelineExecutionResult> {
  const bundle = await loadSourceBundle(options);
  const auditResult = auditWordPressSource(bundle);
  const transformResults = transformBundleItems(bundle.contentItems);
  const importPlan = createImportPlan(bundle, transformResults, options.target);
  const adapter = new PlanningOnlyEmDashTargetAdapter();
  const adapterResult = await adapter.execute(importPlan, options.target);
  const summary = await writeArtifacts({
    outputDir: options.outputDir,
    auditResult,
    transformResults,
    importPlan,
    totalItems: bundle.contentItems.length
  });

  return {
    bundle,
    auditResult,
    transformResults,
    summary,
    adapterNote: adapterResult.note
  };
}

export function regenerateReportFromAudit(auditResult: AuditResult): string {
  return renderMigrationReport(auditResult);
}
