import { describe, expect, it } from "vitest";

import type { RestApiPayload } from "../connectors/rest.js";

import { normalizeRestApiBundle } from "../connectors/rest.js";
import { readJsonFixture } from "./helpers.js";

describe("normalizeRestApiBundle", () => {
  it("normalizes REST payloads into a WordPressSourceBundle", async () => {
    const payload = await readJsonFixture<RestApiPayload>("sample-rest.json");
    const bundle = normalizeRestApiBundle(payload, "https://rest.example.com/wp-json");

    expect(bundle.site.sourceKind).toBe("api");
    expect(bundle.contentItems).toHaveLength(3);
    expect(bundle.media[0]?.sourceUrl).toContain("rest-hero.jpg");
    expect(bundle.customPostTypes).toEqual([
      {
        slug: "book",
        label: "Books",
        itemCount: 1
      }
    ]);
  });
});
