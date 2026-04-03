"use client";

import { Panel, SectionHeader } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";
import type { AuditResult } from "@wp2emdash/shared-types";

export function BlockInventoryTable({ audit }: { audit: AuditResult }) {
  const { locale } = useLocale();

  return (
    <Panel>
      <SectionHeader
        eyebrow={locale === "vi" ? "Kiểm tra chi tiết" : "Detailed inspection"}
        title={locale === "vi" ? "Kiểm kê block" : "Block inventory"}
        description={
          locale === "vi"
            ? "Các chữ ký block được hỗ trợ và chưa hỗ trợ đã phát hiện trong snapshot nguồn hiện tại."
            : "Supported and unsupported block signatures detected in the current source snapshot."
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-panel-strong">
            <tr>
              <th className="border-b border-line px-4 py-3 text-left font-semibold text-slate-700">Block</th>
              <th className="border-b border-line px-4 py-3 text-left font-semibold text-slate-700">{locale === "vi" ? "Hỗ trợ" : "Support"}</th>
              <th className="border-b border-line px-4 py-3 text-right font-semibold text-slate-700">{locale === "vi" ? "Số lượng" : "Count"}</th>
            </tr>
          </thead>
          <tbody>
            {audit.blockInventory.map((entry) => (
              <tr key={entry.blockName} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{entry.blockName}</td>
                <td className="px-4 py-3 text-slate-700">{entry.supported ? (locale === "vi" ? "Được hỗ trợ" : "Supported") : locale === "vi" ? "Cần fallback" : "Needs fallback"}</td>
                <td className="px-4 py-3 text-right text-slate-700">{entry.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ShortcodeInventoryTable({ audit }: { audit: AuditResult }) {
  const { locale } = useLocale();

  return (
    <Panel>
      <SectionHeader
        eyebrow={locale === "vi" ? "Kiểm tra chi tiết" : "Detailed inspection"}
        title={locale === "vi" ? "Kiểm kê shortcode" : "Shortcode inventory"}
        description={
          locale === "vi"
            ? "Shortcode được giữ lại thay vì render, nên bảng này giúp đội ngũ ước tính phần chỉnh sửa thủ công."
            : "Shortcodes are preserved instead of rendered, so this table helps the team estimate manual cleanup work."
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-panel-strong">
            <tr>
              <th className="border-b border-line px-4 py-3 text-left font-semibold text-slate-700">Shortcode</th>
              <th className="border-b border-line px-4 py-3 text-right font-semibold text-slate-700">{locale === "vi" ? "Số lượng" : "Count"}</th>
            </tr>
          </thead>
          <tbody>
            {audit.shortcodeInventory.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-sm text-muted" colSpan={2}>
                  {locale === "vi" ? "Không phát hiện shortcode nào trong snapshot hiện tại." : "No shortcodes were detected in the current snapshot."}
                </td>
              </tr>
            ) : (
              audit.shortcodeInventory.map((entry) => (
                <tr key={entry.shortcode} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{entry.shortcode}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{entry.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
