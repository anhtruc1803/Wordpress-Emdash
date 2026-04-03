import type {
  AuditResult,
  ImportExecutionResult,
  ImportPlan,
  LoadSourceOptions,
  PipelineArtifactsSummary,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { createEmDashTargetAdapter } from "./adapters/emdash-target.js";
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
  importPlan?: ImportPlan;
  importResult?: ImportExecutionResult;
  summary: PipelineArtifactsSummary;
  adapterNote?: string;
}

export interface CommandOptions extends LoadSourceOptions {
  outputDir: string;
}

export interface ImportCommandOptions extends CommandOptions {
  target: string;
  apiToken?: string;
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
    importPlan,
    summary
  };
}

export async function executeImport(options: ImportCommandOptions): Promise<PipelineExecutionResult> {
  const bundle = await loadSourceBundle(options);
  const auditResult = auditWordPressSource(bundle);
  const transformResults = transformBundleItems(bundle.contentItems);
  const importPlan = createImportPlan(bundle, transformResults, options.target);
  const adapter = createEmDashTargetAdapter({
    url: options.target,
    apiToken: options.apiToken
  });
  const importResult = await adapter.execute(importPlan, bundle, {
    url: options.target,
    apiToken: options.apiToken
  });
  const summary = await writeArtifacts({
    outputDir: options.outputDir,
    auditResult,
    transformResults,
    importPlan,
    importResult,
    totalItems: bundle.contentItems.length
  });

  return {
    bundle,
    auditResult,
    transformResults,
    importPlan,
    summary,
    importResult,
    adapterNote: importResult.note
  };
}

export function regenerateReportFromAudit(auditResult: AuditResult): string {
  return renderMigrationReport(auditResult);
}
