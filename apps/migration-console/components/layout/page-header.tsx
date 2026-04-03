"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RecommendationBadge, StatusBadge } from "@/components/data-display/badges";
import { useLocale } from "@/components/layout/locale-provider";
import type { ProjectStatus, RecommendationLabel } from "@/lib/types/ui";

export function PageHeader({
  title,
  description,
  backHref,
  status,
  recommendation,
  actions
}: {
  title: string;
  description?: string;
  backHref?: string;
  status?: ProjectStatus;
  recommendation?: RecommendationLabel;
  actions?: React.ReactNode;
}) {
  const { locale } = useLocale();

  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="space-y-3">
        {backHref ? (
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            {locale === "vi" ? "Quay lại" : "Back"}
          </Link>
        ) : null}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {status ? <StatusBadge status={status} /> : null}
            {recommendation ? <RecommendationBadge recommendation={recommendation} /> : null}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
          </div>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
