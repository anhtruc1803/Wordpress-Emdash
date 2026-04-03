import { describe, expect, it } from "vitest";

import { detectShortcodes } from "../transformers/shortcodes.js";

describe("detectShortcodes", () => {
  it("finds shortcode occurrences and preserves raw values", () => {
    const results = detectShortcodes(`[gallery ids="1,2"][contact-form-7 id="9"][/contact-form-7]`);

    expect(results.map((entry) => entry.name)).toEqual(["gallery", "contact-form-7"]);
    expect(results[0]?.raw).toBe(`[gallery ids="1,2"]`);
  });
});
