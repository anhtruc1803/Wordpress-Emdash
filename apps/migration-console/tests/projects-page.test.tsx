import React from "react";
import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { LocaleProvider } from "@/components/layout/locale-provider";
import type { ProjectRecord } from "@/lib/types/ui";

const projects: ProjectRecord[] = [
  {
    id: "project-1",
    name: "Acme migration",
    status: "Dry Run Complete",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-02T11:00:00.000Z",
    source: {
      kind: "wxr",
      input: "C:/fixtures/acme.xml",
      fileName: "acme.xml",
      label: "acme.xml"
    },
    target: null,
    sourceValidation: {
      state: "valid",
      checkedAt: "2026-04-02T11:00:00.000Z",
      message: "Source validated successfully."
    },
    targetValidation: {
      state: "unknown"
    },
    recommendation: "Cleanup Needed",
    difficulty: {
      level: "Medium",
      score: 56,
      reasons: ["Unsupported block coverage is incomplete."]
    }
  }
];

vi.mock("@/lib/hooks/queries", () => ({
  useProjectsQuery: () => ({
    data: projects,
    isLoading: false,
    isError: false
  })
}));

import ProjectsPage from "@/app/app/projects/page";

describe("ProjectsPage", () => {
  it("renders the project list screen with project status and recommendation", () => {
    render(
      <LocaleProvider initialLocale="vi">
        <ProjectsPage />
      </LocaleProvider>
    );

    const table = screen.getByRole("table");

    expect(screen.getByText("Dự án migration")).toBeInTheDocument();
    expect(screen.getByText("Acme migration")).toBeInTheDocument();
    expect(within(table).getByText("Đã chạy thử")).toBeInTheDocument();
    expect(within(table).getByText("Cần dọn thủ công")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tạo dự án/i })).toHaveAttribute("href", "/app/projects/new");
  });
});
