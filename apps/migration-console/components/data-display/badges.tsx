"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { useLocale } from "@/components/layout/locale-provider";
import { translateProjectStatus, translateRecommendation, translateSeverity } from "@/lib/i18n/ui";
import type { ProjectStatus, RecommendationLabel, UiSeverity } from "@/lib/types/ui";
import { cn } from "@/lib/utils";

const badgeStyles = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      tone: {
        neutral: "border-slate-300 bg-white text-slate-700",
        info: "border-blue-200 bg-blue-50 text-blue-700",
        low: "border-slate-200 bg-slate-100 text-slate-700",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        high: "border-rose-200 bg-rose-50 text-rose-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

function BaseBadge({
  className,
  tone,
  children
}: React.PropsWithChildren<{ className?: string } & VariantProps<typeof badgeStyles>>) {
  return <span className={cn(badgeStyles({ tone }), className)}>{children}</span>;
}

export function SeverityBadge({ severity }: { severity: UiSeverity }) {
  const { locale } = useLocale();
  const tone = severity === "high" ? "high" : severity === "medium" ? "medium" : severity === "low" ? "low" : "info";
  return <BaseBadge tone={tone}>{translateSeverity(severity, locale)}</BaseBadge>;
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { locale } = useLocale();
  const tone =
    status === "Ready for Import"
      ? "success"
      : status === "Blocked"
        ? "high"
        : status === "Dry Run Complete"
          ? "info"
          : "neutral";
  return <BaseBadge tone={tone}>{translateProjectStatus(status, locale)}</BaseBadge>;
}

export function RecommendationBadge({ recommendation }: { recommendation?: RecommendationLabel }) {
  const { locale } = useLocale();

  if (!recommendation) {
    return <BaseBadge tone="neutral">{translateRecommendation(undefined, locale)}</BaseBadge>;
  }

  const tone = recommendation === "Ready" ? "success" : recommendation === "Cleanup Needed" ? "medium" : "high";
  return <BaseBadge tone={tone}>{translateRecommendation(recommendation, locale)}</BaseBadge>;
}
