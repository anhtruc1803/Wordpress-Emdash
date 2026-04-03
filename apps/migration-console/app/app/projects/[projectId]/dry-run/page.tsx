"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { Panel, SectionHeader, StatCard } from "@/components/data-display/cards";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { useRunDryRunMutation, useWorkspaceQuery } from "@/lib/hooks/queries";

export default function DryRunPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const runDryRun = useRunDryRunMutation(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải kết quả dry run..." : "Loading dry run results..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được dry run" : "Unable to load dry run"}
        description={locale === "vi" ? "Workspace dry run hiện không thể mở." : "The dry-run workspace is currently unavailable."}
      />
    );
  }

  if (!data.snapshot.transformResults || !data.snapshot.importPlan) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa hoàn tất dry run" : "Dry run has not completed"}
        description={
          locale === "vi"
            ? "Hãy chạy dry run để tạo transform preview, import plan và backlog chỉnh sửa thủ công."
            : "Run the dry run to generate a transform preview, import plan, and manual-fix backlog."
        }
        action={<Button onClick={() => void runDryRun.mutateAsync()}>{locale === "vi" ? "Chạy dry run" : "Run dry run"}</Button>}
      />
    );
  }

  const transformResults = data.snapshot.transformResults;
  const fallbackCount = transformResults.reduce((sum, result) => sum + result.fallbackBlocks.length, 0);
  const warningCount = transformResults.reduce((sum, result) => sum + result.warnings.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Kết quả dry run" : "Dry-run results"}
        description={
          locale === "vi"
            ? "Xem bao nhiêu nội dung transform sạch, chỗ nào có fallback và kế hoạch import hiện tại sẽ tạo ra những gì."
            : "See how many items transform cleanly, where fallbacks appear, and what the current import plan would create."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />

      <StickyActionBar>
        <Button onClick={() => void runDryRun.mutateAsync()} disabled={runDryRun.isPending}>
          {locale === "vi" ? "Chạy lại dry run" : "Rerun dry run"}
        </Button>
        <Link href={`/app/projects/${projectId}/transform-preview`}>
          <Button variant="secondary">{locale === "vi" ? "Xem transform preview" : "View transform preview"}</Button>
        </Link>
        <Link href={`/app/projects/${projectId}/import-plan`}>
          <Button variant="secondary">{locale === "vi" ? "Mở kế hoạch import" : "Open import plan"}</Button>
        </Link>
      </StickyActionBar>

      <div className="grid gap-4 lg:grid-cols-5">
        <StatCard label={locale === "vi" ? "Mục đã transform" : "Transformed items"} value={`${transformResults.length}`} detail={locale === "vi" ? "Mục đã có đầu ra transform" : "Items with transform output"} tone="info" />
        <StatCard label={locale === "vi" ? "Block fallback" : "Fallback blocks"} value={`${fallbackCount}`} detail={locale === "vi" ? "Block chưa hỗ trợ được giữ lại để rà soát" : "Unsupported blocks preserved for review"} tone={fallbackCount > 0 ? "warning" : "success"} />
        <StatCard label={locale === "vi" ? "Cảnh báo" : "Warnings"} value={`${warningCount}`} detail={locale === "vi" ? "Cảnh báo transform ở cấp mục" : "Item-level transform warnings"} tone={warningCount > 0 ? "warning" : "success"} />
        <StatCard label={locale === "vi" ? "Chưa xử lý" : "Unresolved"} value={`${data.snapshot.importPlan.unresolvedItems.length}`} detail={locale === "vi" ? "Mục cần quyết định thủ công" : "Items that still need manual decisions"} tone={data.snapshot.importPlan.unresolvedItems.length > 0 ? "warning" : "success"} />
        <StatCard label={locale === "vi" ? "Chỉnh sửa thủ công" : "Manual fixes"} value={`${data.manualFixes.length}`} detail={locale === "vi" ? "Backlog vận hành từ lần dry run hiện tại" : "Operational backlog from the current dry run"} tone={data.manualFixes.length > 0 ? "warning" : "success"} />
      </div>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Mức sẵn sàng" : "Readiness"}
          title={locale === "vi" ? "Tiếp tục hay rà soát thêm?" : "Proceed or inspect further?"}
          description={
            locale === "vi"
              ? "Dry run là phép xấp xỉ tốt nhất hiện tại cho việc điều gì sẽ xảy ra nếu đội ngũ tiến đến bước import."
              : "The dry run is the best current approximation of what will happen if the team proceeds to import."
          }
        />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <Link href={`/app/projects/${projectId}/manual-fixes`} className="rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
            <p className="font-semibold text-slate-900">{locale === "vi" ? "Chỉnh sửa thủ công" : "Manual fixes"}</p>
            <p className="mt-1 text-sm text-muted">
              {locale === "vi" ? "Rà soát các vấn đề vận hành, người phụ trách và ghi chú." : "Review operational issues, assignees, and notes."}
            </p>
          </Link>
          <Link href={`/app/projects/${projectId}/transform-preview`} className="rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
            <p className="font-semibold text-slate-900">Transform preview</p>
            <p className="mt-1 text-sm text-muted">
              {locale === "vi" ? "Soi song song nguồn dữ liệu, cảnh báo và đầu ra có cấu trúc." : "Inspect source content, warnings, and structured output side by side."}
            </p>
          </Link>
          <Link href={`/app/projects/${projectId}/import-plan`} className="rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
            <p className="font-semibold text-slate-900">{locale === "vi" ? "Kế hoạch import" : "Import plan"}</p>
            <p className="mt-1 text-sm text-muted">
              {locale === "vi" ? "Xác thực mapping collection, media và các target chưa xử lý." : "Validate collection mapping, media handling, and unresolved target decisions."}
            </p>
          </Link>
        </div>
      </Panel>
    </div>
  );
}
