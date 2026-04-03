"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { RecommendationBadge, StatusBadge } from "@/components/data-display/badges";
import { Panel, SectionHeader, StatCard } from "@/components/data-display/cards";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { RiskBreakdownPanel } from "@/components/domain/risk-breakdown-panel";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { useDashboardQuery } from "@/lib/hooks/queries";
import { translateActivityMessage } from "@/lib/i18n/ui";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { locale } = useLocale();
  const { data, isLoading, isError, refetch } = useDashboardQuery();

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải bảng điều khiển..." : "Loading dashboard..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được bảng điều khiển" : "Unable to load the dashboard"}
        description={
          locale === "vi"
            ? "Migration console không thể tải hoạt động dự án vào lúc này."
            : "The migration console could not load project activity right now."
        }
      />
    );
  }

  if (data.totalProjects === 0) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa có dự án migration nào" : "No migration projects yet"}
        description={
          locale === "vi"
            ? "Tạo dự án đầu tiên để kết nối nguồn WordPress, kiểm tra độ khó migration và lập kế hoạch import."
            : "Create your first project to connect a WordPress source, assess migration difficulty, and prepare an import plan."
        }
        action={
          <Link href="/app/projects/new">
            <Button>{locale === "vi" ? "Tạo dự án" : "Create project"}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Tổng quan migration" : "Migration dashboard"}
        description={
          locale === "vi"
            ? "Theo dõi mức sẵn sàng của dự án, mật độ rủi ro và backlog chỉnh sửa thủ công trên toàn workspace."
            : "Track project readiness, risk density, and the manual-fix backlog across the workspace."
        }
        actions={
          <>
            <Link href="/app/projects/new">
              <Button>{locale === "vi" ? "Tạo dự án" : "Create project"}</Button>
            </Link>
            <Button variant="secondary" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {locale === "vi" ? "Làm mới" : "Refresh"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label={locale === "vi" ? "Tổng số dự án" : "Total projects"}
          value={`${data.totalProjects}`}
          detail={locale === "vi" ? "Tất cả workspace migration" : "All migration workspaces"}
        />
        <StatCard
          label={locale === "vi" ? "Sẵn sàng import" : "Ready for import"}
          value={`${data.readyProjects}`}
          detail={locale === "vi" ? "Dự án có thể tiếp tục với rủi ro thấp" : "Projects that can proceed with low risk"}
          tone="success"
        />
        <StatCard
          label={locale === "vi" ? "Đang bị chặn" : "Blocked"}
          value={`${data.blockedProjects}`}
          detail={locale === "vi" ? "Dự án có lỗi chặn hoặc khuyến nghị dựng lại" : "Projects with blocking issues or rebuild recommendations"}
          tone="danger"
        />
        <StatCard
          label={locale === "vi" ? "Chỉnh sửa thủ công đang mở" : "Open manual fixes"}
          value={`${data.openManualFixes}`}
          detail={locale === "vi" ? "Backlog vận hành trên toàn workspace" : "Operational backlog across the workspace"}
          tone="warning"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <RiskBreakdownPanel items={data.riskDistribution} />
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Trạng thái dự án" : "Project status"}
            title={locale === "vi" ? "Phân bổ theo tiến trình workflow" : "Workflow status distribution"}
            description={
              locale === "vi"
                ? "Ảnh chụp nhanh giúp PM hoặc tech lead biết migration đang tiến triển hay kẹt ở đâu."
                : "A quick view for PMs and tech leads to see where migrations are progressing or blocked."
            }
          />
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {data.statusBreakdown.map((entry) => (
              <div key={entry.status} className="rounded-2xl border border-line bg-panel-strong p-4">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={entry.status} />
                  <span className="text-2xl font-semibold tracking-tight text-slate-950">{entry.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Hoạt động gần đây" : "Recent activity"}
            title={locale === "vi" ? "Sự kiện mới nhất trong workspace" : "Latest workspace activity"}
            description={
              locale === "vi"
                ? "Các lần audit, dry run, xác thực nguồn dữ liệu và cập nhật dự án mới nhất."
                : "Recent audit runs, dry runs, source validations, and project updates."
            }
          />
          <div className="space-y-3 p-5">
            {data.recentActivity.map((event) => (
              <div key={event.id} className="rounded-2xl border border-line bg-panel-strong p-4">
                <p className="text-sm font-semibold text-slate-900">{translateActivityMessage(event, locale)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{formatDate(event.at, locale)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Dự án" : "Projects"}
            title={locale === "vi" ? "Workspace gần đây" : "Recent workspaces"}
            description={
              locale === "vi"
                ? "Nhảy thẳng từ dashboard vào một workspace migration cụ thể."
                : "Jump directly from the dashboard into a specific migration workspace."
            }
            actions={
              <Link href="/app/projects">
                <Button variant="secondary">{locale === "vi" ? "Xem tất cả dự án" : "View all projects"}</Button>
              </Link>
            }
          />
          <div className="space-y-3 p-5">
            {data.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}/overview`}
                className="block rounded-2xl border border-line bg-panel-strong p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold tracking-tight text-slate-950">{project.name}</h3>
                    <p className="text-sm text-muted">
                      {project.source?.label ?? (locale === "vi" ? "Chưa cấu hình nguồn dữ liệu" : "Source not configured")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={project.status} />
                    <RecommendationBadge recommendation={project.recommendation} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
