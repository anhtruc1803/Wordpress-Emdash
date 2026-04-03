import { describe, expect, it } from "vitest";

import { auditWordPressSource } from "../auditors/audit-source.js";
import { parseWxrXml } from "../parsers/wxr.js";
import { createImportPlan } from "../planners/create-import-plan.js";
import { renderMigrationReport } from "../reporters/markdown-report.js";
import { transformBundleItems } from "../transformers/structured-transform.js";
import { readFixture } from "./helpers.js";

describe("renderMigrationReport", () => {
  it("renders a readable markdown report from audit and plan data", async () => {
    const xml = await readFixture("sample-wxr.xml");
    const bundle = parseWxrXml(xml);
    const audit = auditWordPressSource(bundle);
    const transforms = transformBundleItems(bundle.contentItems);
    const plan = createImportPlan(bundle, transforms);
    const report = renderMigrationReport(audit, plan);

    expect(report).toContain("# Migration Report");
    expect(report).toContain("Sample WordPress Site");
    expect(report).toContain("Recommendation:");
    expect(report).toContain("Import Planning Summary");
  });
});
