"use client";

import { useEffect } from "react";
import { AlertTriangle, FileJson, FileText, Layers3 } from "lucide-react";

import { RecommendationBadge, SeverityBadge } from "@/components/data-display/badges";
import { Panel } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";
import { useTransformStore } from "@/lib/hooks/transform-store";
import type { MigrationItemDetail } from "@/lib/types/ui";

export function TransformCompareView({ items }: { items: MigrationItemDetail[] }) {
  const { locale } = useLocale();
  const { selectedItemId, setSelectedItemId } = useTransformStore();
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0];

  useEffect(() => {
    if (!selectedItemId && items[0]) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId, setSelectedItemId]);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr_1fr]">
      <Panel className="overflow-hidden">
        <div className="border-b border-line px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{locale === "vi" ? "Mục nội dung" : "Content items"}</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            {locale === "vi" ? "Chọn một mục để kiểm tra hành vi transform." : "Select an item to inspect transform behavior."}
          </h2>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-3">
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  item.id === selectedItem?.id ? "border-slate-900 bg-slate-950 text-white" : "border-line bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${item.id === selectedItem?.id ? "text-slate-300" : "text-muted"}`}>
                  {item.type} #{item.id}
                </p>
                <p className={`mt-2 line-clamp-2 text-xs leading-5 ${item.id === selectedItem?.id ? "text-slate-200" : "text-muted"}`}>
                  {item.manualFixes.length > 0
                    ? locale === "vi"
                      ? `${item.manualFixes.length} vấn đề đang gắn với mục này.`
                      : `${item.manualFixes.length} issue(s) are attached to this item.`
                    : locale === "vi"
                      ? "Không có chỉnh sửa thủ công nào được gắn."
                      : "No manual fixes are attached."}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <FileText className="h-4 w-4" />
            {locale === "vi" ? "Xem trước nguồn" : "Source preview"}
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            {selectedItem?.title ?? (locale === "vi" ? "Chưa chọn mục nào" : "No item selected")}
          </h2>
        </div>
        {selectedItem ? (
          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {locale === "vi" ? "Nội dung WordPress thô" : "Raw WordPress content"}
              </p>
              <pre className="mt-3 max-h-[52vh] whitespace-pre-wrap">{selectedItem.rawContent}</pre>
            </div>
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {locale === "vi" ? "Cảnh báo và chỉnh sửa liên quan" : "Warnings and related fixes"}
              </p>
              <div className="mt-3 space-y-3">
                {(selectedItem.transform?.warnings ?? []).map((warning) => (
                  <div key={`${warning.code}-${warning.message}`} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3">
                    <AlertTriangle className="mt-1 h-4 w-4 text-amber-600" />
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <SeverityBadge severity={warning.severity === "error" ? "high" : warning.severity === "warning" ? "medium" : "info"} />
                        <RecommendationBadge recommendation="Cleanup Needed" />
                      </div>
                      <p className="text-sm text-slate-700">{warning.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <Layers3 className="h-4 w-4" />
            {locale === "vi" ? "Đầu ra có cấu trúc" : "Structured output"}
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            {locale === "vi" ? "Cấu trúc sau transform và payload fallback" : "Post-transform structure and fallback payload"}
          </h2>
        </div>
        {selectedItem ? (
          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <FileJson className="h-4 w-4" />
                {locale === "vi" ? "Nội dung có cấu trúc" : "Structured content"}
              </div>
              <pre className="mt-3 max-h-[32vh]">{JSON.stringify(selectedItem.transform?.structuredContent ?? [], null, 2)}</pre>
            </div>
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {locale === "vi" ? "Đối tượng fallback / node chưa hỗ trợ" : "Fallback objects / unsupported nodes"}
              </p>
              <pre className="mt-3 max-h-[18vh]">
                {JSON.stringify(
                  {
                    fallbackBlocks: selectedItem.transform?.fallbackBlocks ?? [],
                    unsupportedNodes: selectedItem.transform?.unsupportedNodes ?? []
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
