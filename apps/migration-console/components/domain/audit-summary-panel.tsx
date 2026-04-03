"use client";

import { AlertTriangle, Boxes, Files, TriangleAlert } from "lucide-react";

import { RecommendationBadge } from "@/components/data-display/badges";
import { Panel, StatCard } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";
import { translateDifficultyLevel, translateDifficultyReason } from "@/lib/i18n/ui";
import { formatCount } from "@/lib/utils";
import type { AuditResult } from "@wp2emdash/shared-types";

export function AuditSummaryPanel({ audit }: { audit: AuditResult }) {
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label={locale === "vi" ? "Điểm độ khó" : "Difficulty score"}
          value={`${audit.difficulty.score}`}
          detail={translateDifficultyLevel(audit.difficulty.level, locale)}
          tone={audit.difficulty.level === "High" ? "danger" : audit.difficulty.level === "Medium" ? "warning" : "success"}
        />
        <StatCard
          label={locale === "vi" ? "Mục chưa hỗ trợ" : "Unsupported items"}
          value={formatCount(audit.unsupportedItems.length, locale)}
          detail={locale === "vi" ? "Cảnh báo và lỗi cần được rà soát" : "Warnings and errors that need review"}
          tone={audit.unsupportedItems.some((item) => item.severity === "error") ? "danger" : "warning"}
        />
        <StatCard
          label={locale === "vi" ? "Loại block" : "Block types"}
          value={formatCount(audit.blockInventory.length, locale)}
          detail={locale === "vi" ? "Các cấu trúc Gutenberg và nội dung cũ đã được phát hiện" : "Detected Gutenberg structures and legacy content shapes"}
          tone="info"
        />
        <StatCard
          label="Shortcode"
          value={formatCount(
            audit.shortcodeInventory.reduce((sum, entry) => sum + entry.count, 0),
            locale
          )}
          detail={locale === "vi" ? "Được giữ lại để xử lý thủ công" : "Preserved for manual handling"}
          tone="warning"
        />
      </div>

      <Panel className="grid gap-4 p-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-1 h-5 w-5 text-amber-600" />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {locale === "vi" ? "Tóm tắt điều hành" : "Executive summary"}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                {locale === "vi"
                  ? `Migration hiện được đánh giá có độ khó ${translateDifficultyLevel(audit.difficulty.level, locale).toLowerCase()}.`
                  : `This migration is currently rated ${translateDifficultyLevel(audit.difficulty.level, locale).toLowerCase()} difficulty.`}
              </h3>
              <p className="text-sm leading-6 text-muted">
                {locale === "vi"
                  ? "Điểm này được quyết định bởi các cấu trúc chưa hỗ trợ, embed hoặc script rủi ro, shortcode và những dấu hiệu plugin hoặc builder được phát hiện trong nội dung."
                  : "This score is driven by unsupported structures, risky embeds or scripts, shortcodes, and plugin or builder signals detected in the content."}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Files className="h-4 w-4 text-blue-600" />
                {locale === "vi" ? "Kiểm kê nội dung" : "Content inventory"}
              </div>
              <p className="mt-2 text-sm text-muted">
                {locale === "vi"
                  ? `${Object.entries(audit.contentCounts).length} nhóm nội dung đã được kiểm kê trên bài viết, trang, media và custom type.`
                  : `${Object.entries(audit.contentCounts).length} content groups were inventoried across posts, pages, media, and custom types.`}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Boxes className="h-4 w-4 text-amber-600" />
                {locale === "vi" ? "Độ phức tạp block" : "Block complexity"}
              </div>
              <p className="mt-2 text-sm text-muted">
                {locale === "vi"
                  ? `${audit.blockInventory.filter((entry) => !entry.supported).length} loại block chưa hỗ trợ đã được phát hiện.`
                  : `${audit.blockInventory.filter((entry) => !entry.supported).length} unsupported block type(s) were detected.`}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel-strong p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                {locale === "vi" ? "Khuyến nghị" : "Recommendation"}
              </div>
              <div className="mt-3">
                <RecommendationBadge
                  recommendation={
                    audit.recommendation === "ready for import"
                      ? "Ready"
                      : audit.recommendation === "import with manual cleanup"
                        ? "Cleanup Needed"
                        : "Rebuild Recommended"
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-slate-950 p-5 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {locale === "vi" ? "Vì sao có điểm số này" : "Why this score exists"}
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            {audit.difficulty.reasons.length > 0 ? (
              audit.difficulty.reasons.map((reason) => <li key={reason}>- {translateDifficultyReason(reason, locale)}</li>)
            ) : (
              <li>
                - {locale === "vi" ? "Không phát hiện tác nhân rủi ro đáng kể nào trong snapshot nguồn hiện tại." : "No notable risk drivers were detected in the current source snapshot."}
              </li>
            )}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
