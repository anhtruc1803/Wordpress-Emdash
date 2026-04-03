import { describe, expect, it } from "vitest";

import { parseWxrXml } from "../parsers/wxr.js";
import { readFixture } from "./helpers.js";

describe("parseWxrXml", () => {
  it("parses posts, pages, media, authors and custom post types", async () => {
    const xml = await readFixture("sample-wxr.xml");
    const bundle = parseWxrXml(xml);

    expect(bundle.site.name).toBe("Sample WordPress Site");
    expect(bundle.authors).toHaveLength(1);
    expect(bundle.media).toHaveLength(1);
    expect(bundle.contentItems).toHaveLength(3);
    expect(bundle.customPostTypes).toEqual([
      {
        slug: "portfolio",
        label: "portfolio",
        itemCount: 1
      }
    ]);
  });
});
