import { describe, expect, it } from "vitest";

import { computeDifficulty, recommendMigration } from "../auditors/difficulty.js";

describe("computeDifficulty", () => {
  it("scores risky migrations as high difficulty", () => {
    const difficulty = computeDifficulty({
      unsupportedBlockCount: 3,
      unsupportedItemCount: 4,
      shortcodeCount: 3,
      builderHintCount: 2,
      rawHtmlCount: 2,
      embedCount: 1,
      scriptCount: 1,
      customPostTypeCount: 1
    });

    expect(difficulty.level).toBe("High");
    expect(recommendMigration(difficulty, 4)).toBe("rebuild recommended");
  });
});
