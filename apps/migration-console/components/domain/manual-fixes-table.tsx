"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { SeverityBadge } from "@/components/data-display/badges";
import { useLocale } from "@/components/layout/locale-provider";
import { DataTable } from "@/components/tables/data-table";
import { translateManualFixStatus } from "@/lib/i18n/ui";
import type { ManualFixRow } from "@/lib/types/ui";

const columnHelper = createColumnHelper<ManualFixRow>();

export function ManualFixesTable({ rows }: { rows: ManualFixRow[] }) {
  const { locale } = useLocale();

  const columns: ColumnDef<ManualFixRow, any>[] = [
    columnHelper.accessor("title", {
      header: locale === "vi" ? "Mục" : "Item",
      cell: (info) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{info.getValue()}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {info.row.original.sourceType} #{info.row.original.sourceId}
          </p>
        </div>
      )
    }),
    columnHelper.accessor("issueType", {
      header: locale === "vi" ? "Loại vấn đề" : "Issue type",
      cell: (info) => <span className="font-medium text-slate-700">{info.getValue()}</span>
    }),
    columnHelper.accessor("severity", {
      header: locale === "vi" ? "Mức độ" : "Severity",
      cell: (info) => <SeverityBadge severity={info.getValue()} />
    }),
    columnHelper.accessor("recommendation", {
      header: locale === "vi" ? "Khuyến nghị" : "Recommendation",
      cell: (info) => <p className="max-w-xs text-sm leading-6 text-slate-700">{info.getValue()}</p>
    }),
    columnHelper.accessor("status", {
      header: locale === "vi" ? "Trạng thái" : "Status",
      cell: (info) => <span className="font-medium text-slate-700">{translateManualFixStatus(info.getValue(), locale)}</span>
    }),
    columnHelper.display({
      id: "open",
      header: locale === "vi" ? "Chi tiết" : "Details",
      cell: (info) => (
        <Link href={`#fix-${info.row.original.id}`} className="text-sm font-semibold text-blue-700 transition hover:text-blue-900">
          {locale === "vi" ? "Mở chi tiết" : "Open details"}
        </Link>
      )
    })
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      searchPlaceholder={
        locale === "vi"
          ? "Tìm theo tiêu đề, loại vấn đề, ID nguồn hoặc khuyến nghị"
          : "Search by title, issue type, source ID, or recommendation"
      }
      searchValueResolver={(row) => `${row.title} ${row.issueType} ${row.sourceId} ${row.recommendation} ${row.detail}`}
      filters={[
        {
          key: "severity",
          label: locale === "vi" ? "Mức độ" : "Severity",
          options: [
            { label: locale === "vi" ? "Thông tin" : "Info", value: "info" },
            { label: locale === "vi" ? "Thấp" : "Low", value: "low" },
            { label: locale === "vi" ? "Trung bình" : "Medium", value: "medium" },
            { label: locale === "vi" ? "Cao" : "High", value: "high" }
          ],
          predicate: (row, value) => row.severity === value
        },
        {
          key: "status",
          label: locale === "vi" ? "Trạng thái" : "Status",
          options: [
            { label: locale === "vi" ? "Đang mở" : "Open", value: "open" },
            { label: locale === "vi" ? "Đang rà soát" : "In review", value: "in_review" },
            { label: locale === "vi" ? "Đã xử lý" : "Resolved", value: "resolved" }
          ],
          predicate: (row, value) => row.status === value
        },
        {
          key: "type",
          label: locale === "vi" ? "Loại nội dung" : "Content type",
          options: Array.from(new Set(rows.map((row) => row.sourceType))).map((value) => ({ label: value, value })),
          predicate: (row, value) => row.sourceType === value
        }
      ]}
      emptyLabel={
        locale === "vi"
          ? "Không có mục chỉnh sửa thủ công nào khớp với bộ lọc hiện tại."
          : "No manual fixes match the current filters."
      }
    />
  );
}
