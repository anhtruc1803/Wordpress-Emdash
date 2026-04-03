"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { RecommendationBadge, StatusBadge } from "@/components/data-display/badges";
import { ErrorState, LoadingState } from "@/components/data-display/states";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { useProjectsQuery } from "@/lib/hooks/queries";
import { translateProjectStatus, translateSourceKind } from "@/lib/i18n/ui";
import type { ProjectRecord } from "@/lib/types/ui";
import { formatDate } from "@/lib/utils";

const columnHelper = createColumnHelper<ProjectRecord>();

export default function ProjectsPage() {
  const { locale } = useLocale();
  const { data, isLoading, isError } = useProjectsQuery();

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải danh sách dự án..." : "Loading projects..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được dự án" : "Unable to load projects"}
        description={locale === "vi" ? "Danh sách dự án hiện không thể tải được." : "The project list is currently unavailable."}
      />
    );
  }

  const columns: ColumnDef<ProjectRecord, any>[] = [
    columnHelper.accessor("name", {
      header: locale === "vi" ? "Dự án" : "Project",
      cell: (info) => (
        <Link href={`/app/projects/${info.row.original.id}/overview`} className="font-semibold text-slate-900 transition hover:text-blue-700">
          {info.getValue()}
        </Link>
      )
    }),
    columnHelper.accessor("status", {
      header: locale === "vi" ? "Trạng thái" : "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />
    }),
    columnHelper.accessor("recommendation", {
      header: locale === "vi" ? "Khuyến nghị" : "Recommendation",
      cell: (info) => <RecommendationBadge recommendation={info.getValue()} />
    }),
    columnHelper.accessor((row) => row.source?.kind ?? "none", {
      id: "sourceKind",
      header: locale === "vi" ? "Nguồn" : "Source",
      cell: (info) => (
        <span className="text-slate-700">
          {info.getValue() === "none" ? (locale === "vi" ? "Chưa có" : "Not configured") : translateSourceKind(info.getValue() as "wxr" | "api", locale)}
        </span>
      )
    }),
    columnHelper.accessor("updatedAt", {
      header: locale === "vi" ? "Cập nhật" : "Updated",
      cell: (info) => <span className="text-slate-700">{formatDate(info.getValue(), locale)}</span>
    })
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Dự án migration" : "Migration projects"}
        description={
          locale === "vi"
            ? "Duyệt các workspace đang hoạt động, xem mức sẵn sàng và đi thẳng tới phần nguồn dữ liệu, audit hoặc dry run."
            : "Browse active workspaces, check readiness, and jump directly into source setup, audit, or dry run."
        }
        actions={
          <Link href="/app/projects/new">
            <Button>{locale === "vi" ? "Tạo dự án" : "Create project"}</Button>
          </Link>
        }
      />

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder={
          locale === "vi"
            ? "Tìm theo tên dự án, nguồn dữ liệu hoặc trạng thái"
            : "Search by project name, source, or status"
        }
        searchValueResolver={(row) => `${row.name} ${translateProjectStatus(row.status, locale)} ${row.source?.label ?? ""}`}
        filters={[
          {
            key: "status",
            label: locale === "vi" ? "Trạng thái" : "Status",
            options: Array.from(new Set(data.map((project) => project.status))).map((value) => ({
              label: translateProjectStatus(value, locale),
              value
            })),
            predicate: (row, value) => row.status === value
          }
        ]}
      />
    </div>
  );
}
