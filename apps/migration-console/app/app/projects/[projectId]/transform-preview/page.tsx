"use client";

import { useParams } from "next/navigation";

import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { TransformCompareView } from "@/components/domain/transform-compare-view";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { useWorkspaceQuery } from "@/lib/hooks/queries";

export default function TransformPreviewPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải transform preview..." : "Loading transform preview..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được transform preview" : "Unable to load transform preview"}
        description={
          locale === "vi"
            ? "Transform preview của dự án này hiện không thể mở."
            : "The transform preview for this project is currently unavailable."
        }
      />
    );
  }

  if (!data.snapshot.transformResults || data.items.length === 0) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa có transform preview" : "No transform preview yet"}
        description={
          locale === "vi"
            ? "Hãy chạy dry run để xem song song nội dung nguồn, cảnh báo, payload fallback và đầu ra có cấu trúc."
            : "Run a dry run to compare source content, warnings, fallback payloads, and structured output side by side."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Xem trước transform" : "Transform preview"}
        description={
          locale === "vi"
            ? "Màn hình ba cột này bám trực tiếp vào kết quả transform thực đang được bridge layer lưu lại."
            : "This three-pane screen is grounded directly in the real transform results stored by the bridge layer."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />
      <TransformCompareView items={data.items} />
    </div>
  );
}
