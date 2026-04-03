#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { AuditResult, GeneratedArtifacts, SourceKind } from "@wp2emdash/shared-types";

import {
  executeAudit,
  executeDryRun,
  executeImport,
  regenerateReportFromAudit
} from "@wp2emdash/migration-core";
import { Command, InvalidOptionArgumentError } from "commander";

function parseSourceKind(value: string): SourceKind {
  if (value === "wxr" || value === "api") {
    return value;
  }

  throw new InvalidOptionArgumentError(`Unsupported source kind "${value}". Expected "wxr" or "api".`);
}

function printArtifacts(outputPaths: GeneratedArtifacts): void {
  for (const [label, path] of Object.entries(outputPaths)) {
    if (path) {
      console.log(`${label}: ${path}`);
    }
  }
}

const program = new Command();

program
  .name("wp2emdash")
  .description("CLI-first assistant for auditing and planning WordPress migrations into EmDash-style structured content workflows.")
  .showHelpAfterError();

program
  .command("audit")
  .description("Audit a WordPress WXR export or REST API and generate a migration report.")
  .argument("<input>", "Path to a WXR file or base WordPress URL/wp-json endpoint")
  .requiredOption("--source <source>", "Source kind: wxr | api", parseSourceKind)
  .option("-o, --output-dir <dir>", "Directory for generated artifacts", "./artifacts")
  .action(async (input: string, options: { source: SourceKind; outputDir: string }) => {
    const result = await executeAudit({
      input,
      sourceKind: options.source,
      outputDir: options.outputDir
    });

    console.log(`Recommendation: ${result.auditResult.recommendation}`);
    console.log(`Difficulty: ${result.auditResult.difficulty.level} (${result.auditResult.difficulty.score})`);
    printArtifacts(result.summary.outputs);
  });

program
  .command("dry-run")
  .description("Run normalization, transform preview, and import planning without a live EmDash import.")
  .argument("<input>", "Path to a WXR file or base WordPress URL/wp-json endpoint")
  .requiredOption("--source <source>", "Source kind: wxr | api", parseSourceKind)
  .option("-o, --output-dir <dir>", "Directory for generated artifacts", "./artifacts")
  .action(async (input: string, options: { source: SourceKind; outputDir: string }) => {
    const result = await executeDryRun({
      input,
      sourceKind: options.source,
      outputDir: options.outputDir
    });

    console.log(`Transformed items: ${result.transformResults?.length ?? 0}`);
    console.log(`Recommendation: ${result.auditResult.recommendation}`);
    printArtifacts(result.summary.outputs);
  });

program
  .command("import")
  .description("Generate an import plan and hand it to the current EmDash adapter boundary.")
  .argument("<input>", "Path to a WXR file or base WordPress URL/wp-json endpoint")
  .requiredOption("--source <source>", "Source kind: wxr | api", parseSourceKind)
  .requiredOption("--target <url>", "Target EmDash URL for planning metadata")
  .option("-o, --output-dir <dir>", "Directory for generated artifacts", "./artifacts")
  .action(async (input: string, options: { source: SourceKind; target: string; outputDir: string }) => {
    const result = await executeImport({
      input,
      sourceKind: options.source,
      outputDir: options.outputDir,
      target: options.target
    });

    if (result.adapterNote) {
      console.log(result.adapterNote);
    }

    printArtifacts(result.summary.outputs);
  });

program
  .command("report")
  .description("Regenerate a Markdown migration report from an audit-result.json file.")
  .argument("<input>", "Path to audit-result.json")
  .option("-o, --output <path>", "Path to write the Markdown report")
  .action(async (input: string, options: { output?: string }) => {
    const auditResult = JSON.parse(await readFile(input, "utf8")) as AuditResult;
    const report = regenerateReportFromAudit(auditResult);
    const outputPath = options.output ?? resolve(dirname(input), "migration-report.regenerated.md");
    await writeFile(outputPath, report, "utf8");
    console.log(`report: ${outputPath}`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  console.error(`[wp2emdash] ${message}`);
  process.exitCode = 1;
});
