"use client";

import { Panel, SectionHeader, StatCard } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";
import type { ImportPlan } from "@wp2emdash/shared-types";

export function ImportPlanSummary({ plan }: { plan: ImportPlan }) {
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label={locale === "vi" ? "Collection" : "Collections"} value={`${plan.collections.length}`} detail={locale === "vi" ? "Nhóm nội dung đích đã được map" : "Mapped target content groups"} />
        <StatCard label={locale === "vi" ? "Bản ghi" : "Entries"} value={`${plan.entriesToCreate.length}`} detail={locale === "vi" ? "Mục đang chờ tạo" : "Entries queued for creation"} tone="info" />
        <StatCard label={locale === "vi" ? "Tài sản" : "Assets"} value={`${plan.mediaToImport.length}`} detail={locale === "vi" ? "Media đã được nhận diện để import" : "Media identified for import"} />
        <StatCard
          label={locale === "vi" ? "Chưa xử lý" : "Unresolved"}
          value={`${plan.unresolvedItems.length}`}
          detail={locale === "vi" ? "Mục cần quyết định thủ công" : "Items needing manual decisions"}
          tone={plan.unresolvedItems.length > 0 ? "warning" : "success"}
        />
      </div>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Mức sẵn sàng" : "Readiness"}
          title={locale === "vi" ? "Tóm tắt kế hoạch import" : "Import-plan summary"}
          description={
            locale === "vi"
              ? "Kế hoạch này phản ánh đầu ra transform hiện tại. Nó bám vào bridge layer thật chứ không dùng schema giả."
              : "This plan reflects the current transform output. It is grounded in the real bridge layer rather than mock schemas."
          }
        />
        <div className="grid gap-6 p-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Collection" : "Collections"}</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {plan.collections.map((collection) => (
                <li key={collection.targetCollection} className="rounded-2xl border border-line bg-panel-strong p-4">
                  <p className="font-semibold text-slate-900">{collection.targetCollection}</p>
                  <p className="mt-1 text-muted">
                    {locale === "vi" ? `${collection.count} mục từ ${collection.sourceType}` : `${collection.count} item(s) from ${collection.sourceType}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Gợi ý rewrite" : "Rewrite suggestions"}</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {plan.rewriteSuggestions.slice(0, 6).map((rewrite) => (
                <li key={rewrite.sourceUrl} className="rounded-2xl border border-line bg-panel-strong p-4">
                  <p className="font-medium text-slate-900">{rewrite.suggestedTargetPath}</p>
                  <p className="mt-1 break-all text-muted">{rewrite.sourceUrl}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{locale === "vi" ? "Mapping chưa xử lý" : "Unresolved mappings"}</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {plan.unresolvedItems.length === 0 ? (
                <li className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  {locale === "vi" ? "Không có mapping nào chưa xử lý trong kế hoạch hiện tại." : "There are no unresolved mappings in the current plan."}
                </li>
              ) : (
                plan.unresolvedItems.slice(0, 6).map((item) => (
                  <li key={`${item.sourceId}-${item.reason}`} className="rounded-2xl border border-line bg-panel-strong p-4">
                    <p className="font-medium text-slate-900">
                      {item.sourceType} #{item.sourceId}
                    </p>
                    <p className="mt-1 text-muted">{item.reason}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}
