"use client";

import { SeverityBadge } from "@/components/data-display/badges";
import { Panel, SectionHeader } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";

export function RiskBreakdownPanel({
  items
}: {
  items: Array<{ severity: "info" | "low" | "medium" | "high"; count: number }>;
}) {
  const { locale } = useLocale();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Panel>
      <SectionHeader
        eyebrow={locale === "vi" ? "Phân bổ rủi ro" : "Risk breakdown"}
        title={locale === "vi" ? "Tương quan mức độ vấn đề" : "Issue severity distribution"}
        description={
          locale === "vi"
            ? "Góc nhìn nhanh về các nhóm vấn đề đang đẩy rủi ro migration lên cao."
            : "A quick view of the issue groups currently driving migration risk upward."
        }
      />
      <div className="space-y-4 p-5">
        {items.length === 0 ? (
          <p className="text-sm text-muted">{locale === "vi" ? "Không phát hiện rủi ro nào trong snapshot hiện tại." : "No risks were detected in the current snapshot."}</p>
        ) : (
          items.map((item) => (
            <div key={item.severity} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={item.severity} />
                  <span className="text-sm font-medium text-slate-900">
                    {item.count} {locale === "vi" ? "phát hiện" : "finding(s)"}
                  </span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {Math.round((item.count / (total || 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.max(8, Math.round((item.count / (total || 1)) * 100))}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
