import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TransformCompareView } from "@/components/domain/transform-compare-view";
import { LocaleProvider } from "@/components/layout/locale-provider";
import { useTransformStore } from "@/lib/hooks/transform-store";
import type { MigrationItemDetail } from "@/lib/types/ui";

const items: MigrationItemDetail[] = [
  {
    id: "201",
    type: "post",
    title: "Launch article",
    slug: "launch-article",
    status: "publish",
    rawContent: "Raw content for launch article",
    transform: {
      itemId: "201",
      sourceType: "post",
      structuredContent: [{ kind: "paragraph", text: "Launch paragraph" }],
      warnings: [
        {
          code: "SHORTCODE_FOUND",
          message: "Shortcode preserved for manual follow-up.",
          severity: "warning"
        }
      ],
      fallbackBlocks: [],
      unsupportedNodes: [],
      shortcodes: [],
      embeddedAssetRefs: []
    },
    manualFixes: []
  },
  {
    id: "202",
    type: "page",
    title: "Pricing page",
    slug: "pricing-page",
    status: "draft",
    rawContent: "Raw content for pricing page",
    transform: {
      itemId: "202",
      sourceType: "page",
      structuredContent: [{ kind: "heading", level: 2, text: "Pricing heading" }],
      warnings: [],
      fallbackBlocks: [
        {
          blockName: "acf/custom-pricing",
          label: "Unsupported pricing block",
          rawPayload: "<!-- wp:acf/custom-pricing -->"
        }
      ],
      unsupportedNodes: [
        {
          blockName: "acf/custom-pricing",
          reason: "Unsupported custom block",
          rawPayload: "<!-- wp:acf/custom-pricing -->"
        }
      ],
      shortcodes: [],
      embeddedAssetRefs: []
    },
    manualFixes: [
      {
        id: "fix-pricing",
        sourceId: "202",
        sourceType: "page",
        title: "Pricing page",
        issueType: "unsupported_block",
        severity: "medium",
        recommendation: "Rebuild the pricing module manually.",
        status: "open",
        detail: "acf/custom-pricing"
      }
    ]
  }
];

describe("TransformCompareView", () => {
  beforeEach(() => {
    useTransformStore.setState({ selectedItemId: undefined });
  });

  it("selects the first item by default and switches panes when another item is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="vi">
        <TransformCompareView items={items} />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Raw content for launch article")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /pricing page/i }));

    await waitFor(() => {
      expect(screen.getByText("Raw content for pricing page")).toBeInTheDocument();
      expect(screen.getAllByText(/acf\/custom-pricing/i).length).toBeGreaterThan(0);
    });
  });
});
