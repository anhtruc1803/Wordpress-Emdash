"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { Panel, SectionHeader } from "@/components/data-display/cards";
import { useLocale } from "@/components/layout/locale-provider";
import { translateArtifactKey } from "@/lib/i18n/ui";
import type { GeneratedArtifacts } from "@wp2emdash/shared-types";

export function ArtifactList({
  projectId,
  artifacts
}: {
  projectId: string;
  artifacts?: GeneratedArtifacts;
}) {
  const { locale } = useLocale();
  const rows = artifacts
    ? Object.entries(artifacts).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    : [];

  return (
    <Panel>
      <SectionHeader
        eyebrow={locale === "vi" ? "Tệp đầu ra được tạo" : "Generated outputs"}
        title="Artifacts"
        description={
          locale === "vi"
            ? "Mỗi tệp trong danh sách này đều đến từ local bridge và pipeline migration-core thật."
            : "Every file in this list comes from the local bridge and the real migration-core pipeline."
        }
      />
      <div className="space-y-3 p-5">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{locale === "vi" ? "Chưa có artifact nào được tạo cho dự án này." : "No artifacts have been generated for this project yet."}</p>
        ) : (
          rows.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-3 rounded-2xl border border-line bg-panel-strong p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{translateArtifactKey(key, locale)}</p>
                  <p className="text-xs leading-6 text-muted">{value}</p>
                </div>
              </div>
              <Link
                href={`/api/projects/${projectId}/artifacts/${key}`}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                {locale === "vi" ? "Tải xuống" : "Download"}
              </Link>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
