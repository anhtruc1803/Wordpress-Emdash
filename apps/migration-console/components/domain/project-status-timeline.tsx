"use client";

import { projectStatusOrder } from "@/components/app-shell/navigation";
import { useLocale } from "@/components/layout/locale-provider";
import { translateProjectStatus } from "@/lib/i18n/ui";
import type { ProjectStatus } from "@/lib/types/ui";
import { cn } from "@/lib/utils";

export function ProjectStatusTimeline({ current }: { current: ProjectStatus }) {
  const { locale } = useLocale();
  const currentIndex = projectStatusOrder.indexOf(current);

  return (
    <div className="grid gap-3 xl:grid-cols-6">
      {projectStatusOrder.map((status, index) => {
        const active = index <= currentIndex && current !== "Blocked";
        const blocked = current === "Blocked" && status === "Blocked";

        return (
          <div
            key={status}
            className={cn(
              "rounded-2xl border px-4 py-4 text-sm",
              blocked
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-line bg-white text-muted"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">{translateProjectStatus(status, locale)}</p>
          </div>
        );
      })}
    </div>
  );
}
