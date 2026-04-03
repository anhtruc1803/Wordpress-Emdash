"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { SeverityBadge } from "@/components/data-display/badges";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { Panel, SectionHeader } from "@/components/data-display/cards";
import { ManualFixesTable } from "@/components/domain/manual-fixes-table";
import { Button } from "@/components/layout/button";
import { Input, Select, Textarea } from "@/components/layout/form-controls";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { useUpdateManualFixMutation, useWorkspaceQuery } from "@/lib/hooks/queries";
import { translateManualFixStatus, translateManualRecommendation } from "@/lib/i18n/ui";
import type { ManualFixRow } from "@/lib/types/ui";

function ManualFixEditor({
  projectId,
  fix
}: {
  projectId: string;
  fix: ManualFixRow;
}) {
  const { locale } = useLocale();
  const mutation = useUpdateManualFixMutation(projectId, fix.id);
  const [status, setStatus] = useState(fix.status);
  const [notes, setNotes] = useState(fix.notes ?? "");
  const [assignee, setAssignee] = useState(fix.assignee ?? "");

  return (
    <div id={`fix-${fix.id}`} className="rounded-2xl border border-line bg-panel-strong p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={fix.severity} />
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {fix.sourceType} #{fix.sourceId}
            </p>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">{fix.title}</h3>
          <p className="text-sm leading-6 text-muted">{fix.detail}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            void mutation.mutateAsync({
              status,
              notes,
              assignee
            })
          }
          disabled={mutation.isPending}
        >
          {locale === "vi" ? "Lưu trạng thái" : "Save state"}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>{locale === "vi" ? "Trạng thái" : "Status"}</span>
          <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="open">{locale === "vi" ? "Đang mở" : "Open"}</option>
            <option value="in_review">{locale === "vi" ? "Đang rà soát" : "In review"}</option>
            <option value="resolved">{locale === "vi" ? "Đã xử lý" : "Resolved"}</option>
          </Select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>{locale === "vi" ? "Người phụ trách" : "Assignee"}</span>
          <Input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder={locale === "vi" ? "Người phụ trách tùy chọn" : "Optional assignee"} />
        </label>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Khuyến nghị" : "Recommendation"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{translateManualRecommendation(fix.recommendation, locale)}</p>
        </div>
      </div>

      <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
        <span>{locale === "vi" ? "Ghi chú" : "Notes"}</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={locale === "vi" ? "Ghi lại quyết định, ràng buộc hoặc thông tin handoff ở đây." : "Capture decisions, constraints, or handoff notes here."} />
      </label>
    </div>
  );
}

export default function ManualFixesPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải danh sách chỉnh sửa thủ công..." : "Loading manual fixes..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được chỉnh sửa thủ công" : "Unable to load manual fixes"}
        description={locale === "vi" ? "Backlog chỉnh sửa thủ công hiện không thể tải." : "The manual-fix backlog is currently unavailable."}
      />
    );
  }

  const openFixes = useMemo(() => data.manualFixes.filter((fix) => fix.status !== "resolved"), [data.manualFixes]);

  if (data.manualFixes.length === 0) {
    return (
      <EmptyState
        title={locale === "vi" ? "Workspace này không có chỉnh sửa thủ công nào" : "This workspace has no manual fixes"}
        description={
          locale === "vi"
            ? "Hãy chạy dry run hoặc xem các vấn đề audit để phát hiện những việc follow-up cần xử lý."
            : "Run a dry run or inspect audit issues to discover follow-up work."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Chỉnh sửa thủ công" : "Manual fixes"}
        description={
          locale === "vi"
            ? "Tìm kiếm, lọc và cập nhật backlog vận hành được tạo từ snapshot migration hiện tại."
            : "Search, filter, and update the operational backlog generated from the current migration snapshot."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />

      <StickyActionBar>
        <Button variant="secondary">{locale === "vi" ? `Đang mở: ${openFixes.length}` : `Open: ${openFixes.length}`}</Button>
        <Button variant="secondary">{locale === "vi" ? `Tổng số: ${data.manualFixes.length}` : `Total: ${data.manualFixes.length}`}</Button>
      </StickyActionBar>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Backlog vận hành" : "Operational backlog"}
          title={locale === "vi" ? "Hàng đợi chỉnh sửa thủ công" : "Manual-fix queue"}
          description={
            locale === "vi"
              ? "Dùng bộ lọc để thu hẹp theo mức độ, loại nội dung hoặc trạng thái. Ghi chú chi tiết và người phụ trách đang được lưu cục bộ trong bridge layer."
              : "Use filters to narrow by severity, content type, or status. Detailed notes and assignee data are currently stored locally in the bridge layer."
          }
        />
        <div className="p-5">
          <ManualFixesTable rows={data.manualFixes} />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Chi tiết xử lý" : "Fix details"}
          title={locale === "vi" ? "Thẻ remediation chi tiết" : "Detailed remediation cards"}
          description={
            locale === "vi"
              ? "Các thẻ này là drill-down theo từng mục cho operations và handoff, kèm trạng thái cục bộ, ghi chú và người phụ trách."
              : "These cards are item-level drill-downs for operations and handoff, including local status, notes, and assignee."
          }
        />
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {data.manualFixes.map((fix) => (
            <div key={fix.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{translateManualFixStatus(fix.status, locale)}</p>
              <ManualFixEditor projectId={projectId} fix={fix} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
