import { describe, expect, it } from "vitest";

import { parseWxrXml } from "../parsers/wxr.js";
import { transformContentItem } from "../transformers/structured-transform.js";
import { readFixture } from "./helpers.js";

describe("transformContentItem", () => {
  it("transforms Gutenberg content into structured nodes and warnings", async () => {
    const xml = await readFixture("sample-wxr.xml");
    const bundle = parseWxrXml(xml);
    const item = bundle.contentItems.find((entry) => entry.id === "101");

    expect(item).toBeDefined();

    const result = transformContentItem(item!);
    const nodeKinds = result.structuredContent.map((node) => node.kind);
    const warningCodes = result.warnings.map((warning) => warning.code);

    expect(nodeKinds).toContain("heading");
    expect(nodeKinds).toContain("paragraph");
    expect(nodeKinds).toContain("image");
    expect(nodeKinds).toContain("html");
    expect(warningCodes).toContain("SHORTCODE_FOUND");
    expect(warningCodes).toContain("RAW_HTML_BLOCK");
    expect(warningCodes).toContain("SCRIPT_FOUND");
  });
});
