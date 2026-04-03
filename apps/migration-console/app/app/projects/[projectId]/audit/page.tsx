"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { Panel, SectionHeader } from "@/components/data-display/cards";
import { AuditSummaryPanel } from "@/components/domain/audit-summary-panel";
import { BlockInventoryTable, ShortcodeInventoryTable } from "@/components/domain/inventory-tables";
import { RiskBreakdownPanel } from "@/components/domain/risk-breakdown-panel";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { useRunAuditMutation, useWorkspaceQuery } from "@/lib/hooks/queries";

export default function AuditPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const runAudit = useRunAuditMutation(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải kết quả audit..." : "Loading audit results..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được audit" : "Unable to load audit"}
        description={locale === "vi" ? "Workspace audit hiện không thể mở." : "The audit workspace is currently unavailable."}
      />
    );
  }

  if (!data.snapshot.auditResult) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa chạy audit" : "Audit has not been run"}
        description={
          locale === "vi"
            ? "Hãy chạy audit để xem độ khó migration, mức hỗ trợ block và các điểm rủi ro."
            : "Run the audit to inspect migration difficulty, block support, and major risk areas."
        }
        action={<Button onClick={() => void runAudit.mutateAsync()}>{locale === "vi" ? "Chạy audit" : "Run audit"}</Button>}
      />
    );
  }

  const audit = data.snapshot.auditResult;

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Kết quả audit" : "Audit results"}
        description={
          locale === "vi"
            ? "Bản đọc kỹ thuật chi tiết về rủi ro migration, kiểm kê nội dung và trạng thái khuyến nghị."
            : "A detailed technical readout of migration risk, content inventory, and recommendation state."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />

      <StickyActionBar>
        <Button onClick={() => void runAudit.mutateAsync()} disabled={runAudit.isPending}>
          {locale === "vi" ? "Chạy lại audit" : "Rerun audit"}
        </Button>
        <Link href={`/app/projects/${projectId}/dry-run`}>
          <Button variant="secondary">{locale === "vi" ? "Mở dry run" : "Open dry run"}</Button>
        </Link>
        <Link href={`/app/projects/${projectId}/artifacts`}>
          <Button variant="secondary">{locale === "vi" ? "Xuất báo cáo" : "Export report"}</Button>
        </Link>
      </StickyActionBar>

      <AuditSummaryPanel audit={audit} />

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <RiskBreakdownPanel items={data.riskBreakdown} />
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Dấu hiệu phát hiện" : "Detected signals"}
            title={locale === "vi" ? "Builder, plugin và khuyến nghị" : "Builders, plugins, and recommendations"}
            description={
              locale === "vi"
                ? "Các tín hiệu giúp giải thích vì sao migration có thể cần thêm rà soát hoặc thậm chí phải dựng lại một phần."
                : "Signals that help explain why the migration may need extra review or even partial rebuild work."
            }
          />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Dấu hiệu builder" : "Builder hints"}</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {audit.builderHints.length > 0
                  ? audit.builderHints.map((hint) => <li key={hint.name}>- {hint.name} ({hint.confidence})</li>)
                  : <li>{locale === "vi" ? "Không phát hiện dấu hiệu builder." : "No builder signals detected."}</li>}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Dấu hiệu plugin" : "Plugin hints"}</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {audit.pluginHints.length > 0
                  ? audit.pluginHints.map((hint) => <li key={hint.name}>- {hint.name} ({hint.confidence})</li>)
                  : <li>{locale === "vi" ? "Không phát hiện dấu hiệu plugin." : "No plugin signals detected."}</li>}
              </ul>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <BlockInventoryTable audit={audit} />
        <ShortcodeInventoryTable audit={audit} />
      </div>
    </div>
  );
}
