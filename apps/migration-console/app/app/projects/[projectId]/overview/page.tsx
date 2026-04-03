"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { KeyValueList, Panel, SectionHeader, StatCard } from "@/components/data-display/cards";
import { ProjectStatusTimeline } from "@/components/domain/project-status-timeline";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { useRunAuditMutation, useRunDryRunMutation, useWorkspaceQuery } from "@/lib/hooks/queries";
import {
  translateDifficultyLevel,
  translateProjectStatus,
  translateRecommendation,
  translateSourceKind,
  translateValidationMessage
} from "@/lib/i18n/ui";
import { formatDate } from "@/lib/utils";

export default function ProjectOverviewPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError, refetch } = useWorkspaceQuery(projectId);
  const auditAction = useRunAuditMutation(projectId);
  const dryRunAction = useRunDryRunMutation(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải tổng quan dự án..." : "Loading project overview..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được dự án" : "Unable to load project"}
        description={
          locale === "vi"
            ? "Workspace migration đã chọn hiện không thể mở."
            : "The selected migration workspace is currently unavailable."
        }
      />
    );
  }

  if (!data.project.source) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa cấu hình nguồn dữ liệu" : "Source is not configured"}
        description={
          locale === "vi"
            ? "Hãy kết nối nguồn WordPress trước khi dự án này có thể được audit hoặc transform."
            : "Connect a WordPress source before this project can be audited or transformed."
        }
        action={
          <Link href={`/app/projects/${projectId}/source`}>
            <Button>{locale === "vi" ? "Mở cấu hình nguồn" : "Open source setup"}</Button>
          </Link>
        }
      />
    );
  }

  const audit = data.snapshot.auditResult;
  const summary = data.snapshot.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.project.name}
        description={
          locale === "vi"
            ? "Dùng workspace này để theo dõi mức sẵn sàng migration, xem lần chạy gần nhất và đi thẳng vào những khu vực rủi ro nhất."
            : "Use this workspace to track migration readiness, review the latest runs, and jump directly into the riskiest areas."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
        actions={
          <>
            <Button variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {locale === "vi" ? "Làm mới dữ liệu" : "Refresh data"}
            </Button>
            <Link href={`/app/projects/${projectId}/artifacts`}>
              <Button variant="secondary">{locale === "vi" ? "Mở artifacts" : "Open artifacts"}</Button>
            </Link>
          </>
        }
      />

      <StickyActionBar>
        <Button onClick={() => void auditAction.mutateAsync()} disabled={auditAction.isPending}>
          {locale === "vi" ? "Chạy audit" : "Run audit"}
        </Button>
        <Button variant="secondary" onClick={() => void dryRunAction.mutateAsync()} disabled={dryRunAction.isPending}>
          {locale === "vi" ? "Chạy thử dry run" : "Run dry run"}
        </Button>
        <Link href={`/app/projects/${projectId}/manual-fixes`}>
          <Button variant="secondary">{locale === "vi" ? "Mở chỉnh sửa thủ công" : "Open manual fixes"}</Button>
        </Link>
        <Link href={`/app/projects/${projectId}/import-plan`}>
          <Button variant="secondary">{locale === "vi" ? "Xem kế hoạch import" : "View import plan"}</Button>
        </Link>
      </StickyActionBar>

      <ProjectStatusTimeline current={data.project.status} />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label={locale === "vi" ? "Độ khó" : "Difficulty"}
          value={audit ? `${audit.difficulty.score}` : locale === "vi" ? "Chờ xử lý" : "Pending"}
          detail={audit ? translateDifficultyLevel(audit.difficulty.level, locale) : locale === "vi" ? "Hãy chạy audit để tính toán" : "Run an audit to calculate this"}
          tone={audit?.difficulty.level === "High" ? "danger" : audit?.difficulty.level === "Medium" ? "warning" : "success"}
        />
        <StatCard
          label={locale === "vi" ? "Lần audit gần nhất" : "Latest audit"}
          value={data.project.latestAuditAt ? formatDate(data.project.latestAuditAt, locale) : locale === "vi" ? "Chưa chạy" : "Not run"}
          detail={locale === "vi" ? "Lần thực thi audit mới nhất" : "Most recent audit execution"}
        />
        <StatCard
          label={locale === "vi" ? "Lần dry run gần nhất" : "Latest dry run"}
          value={data.project.latestDryRunAt ? formatDate(data.project.latestDryRunAt, locale) : locale === "vi" ? "Chưa chạy" : "Not run"}
          detail={locale === "vi" ? "Lần xem trước transform và import-plan mới nhất" : "Most recent transform preview and import-plan run"}
        />
        <StatCard
          label={locale === "vi" ? "Chỉnh sửa thủ công" : "Manual fixes"}
          value={`${data.manualFixes.filter((fix) => fix.status !== "resolved").length}`}
          detail={locale === "vi" ? "Mục follow-up đang mở" : "Open follow-up items"}
          tone={data.manualFixes.length > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Tóm tắt workspace" : "Workspace summary"}
            title={locale === "vi" ? "Sức khỏe nguồn dữ liệu và dự án" : "Source and project health"}
            description={
              locale === "vi"
                ? "Panel này giữ cho hợp đồng migration luôn nhìn thấy được mà không buộc đội ngũ phải mở artifact thô trước."
                : "This panel keeps the migration contract visible without forcing the team to open raw artifacts first."
            }
          />
          <div className="p-5">
            <KeyValueList
              values={[
                { label: locale === "vi" ? "Nhãn nguồn dữ liệu" : "Source label", value: data.project.source.label },
                { label: locale === "vi" ? "Loại nguồn" : "Source type", value: translateSourceKind(data.project.source.kind, locale) },
                {
                  label: locale === "vi" ? "Xác thực" : "Validation",
                  value: translateValidationMessage(data.project.sourceValidation.message, locale) ?? data.project.sourceValidation.state
                },
                { label: locale === "vi" ? "Trạng thái hiện tại" : "Current status", value: translateProjectStatus(data.project.status, locale) },
                { label: locale === "vi" ? "Khuyến nghị" : "Recommendation", value: translateRecommendation(data.project.recommendation, locale) },
                {
                  label: locale === "vi" ? "Thư mục đầu ra" : "Output directory",
                  value: summary?.outputs.outputDir ?? (locale === "vi" ? "Chưa có đầu ra từ lần chạy nào" : "No run output yet")
                }
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Bước tiếp theo" : "Next steps"}
            title={locale === "vi" ? "Luồng thao tác gợi ý" : "Suggested workflow"}
            description={
              locale === "vi"
                ? "Lộ trình ngắn gọn cho kỹ sư, PM hoặc reviewer nội dung khi vừa vào dự án."
                : "A short path for engineers, PMs, or content reviewers when they first enter a project."
            }
          />
          <div className="space-y-3 p-5">
            <Link href={`/app/projects/${projectId}/audit`} className="block rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
              <p className="font-semibold text-slate-900">{locale === "vi" ? "Mở kết quả audit" : "Open audit results"}</p>
              <p className="mt-1 text-sm text-muted">
                {locale === "vi"
                  ? "Xem các yếu tố làm tăng độ khó, số liệu kiểm kê và dấu hiệu plugin hoặc builder."
                  : "Review difficulty drivers, inventory metrics, and plugin or builder signals."}
              </p>
            </Link>
            <Link href={`/app/projects/${projectId}/manual-fixes`} className="block rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
              <p className="font-semibold text-slate-900">{locale === "vi" ? "Rà soát chỉnh sửa thủ công" : "Review manual fixes"}</p>
              <p className="mt-1 text-sm text-muted">
                {locale === "vi"
                  ? "Phân loại các mục nội dung đang bị chặn bởi shortcode, block chưa hỗ trợ hoặc HTML rủi ro."
                  : "Triage content items blocked by shortcodes, unsupported blocks, or risky HTML."}
              </p>
            </Link>
            <Link href={`/app/projects/${projectId}/transform-preview`} className="block rounded-2xl border border-line bg-panel-strong p-4 transition hover:bg-white">
              <p className="font-semibold text-slate-900">{locale === "vi" ? "Kiểm tra transform preview" : "Inspect transform preview"}</p>
              <p className="mt-1 text-sm text-muted">
                {locale === "vi"
                  ? "So sánh nội dung WordPress thô với đầu ra có cấu trúc và payload fallback."
                  : "Compare raw WordPress content with structured output and fallback payloads."}
              </p>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
