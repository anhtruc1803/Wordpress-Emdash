import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ManualFixesTable } from "@/components/domain/manual-fixes-table";
import { LocaleProvider } from "@/components/layout/locale-provider";
import type { ManualFixRow } from "@/lib/types/ui";

const rows: ManualFixRow[] = [
  {
    id: "fix-1",
    sourceId: "101",
    sourceType: "post",
    title: "Homepage migration",
    issueType: "shortcode",
    severity: "high",
    recommendation: "Replace shortcode with a structured callout.",
    status: "open",
    detail: "[cta_banner]"
  },
  {
    id: "fix-2",
    sourceId: "102",
    sourceType: "page",
    title: "About page",
    issueType: "raw_html",
    severity: "low",
    recommendation: "Clean up the HTML and keep semantic blocks only.",
    status: "resolved",
    detail: "<div>legacy html</div>"
  }
];

describe("ManualFixesTable", () => {
  it("filters rows by severity and search text", async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="vi">
        <ManualFixesTable rows={rows} />
      </LocaleProvider>
    );

    expect(screen.getByText("Homepage migration")).toBeInTheDocument();
    expect(screen.getByText("About page")).toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");
    await user.selectOptions(comboboxes[0]!, "high");

    expect(screen.getByText("Homepage migration")).toBeInTheDocument();
    expect(screen.queryByText("About page")).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Tìm theo tiêu đề, loại vấn đề, ID nguồn hoặc khuyến nghị");
    await user.clear(searchInput);
    await user.type(searchInput, "callout");

    const table = screen.getByRole("table");
    expect(within(table).getByText("Homepage migration")).toBeInTheDocument();
    expect(within(table).queryByText("About page")).not.toBeInTheDocument();
  });
});
