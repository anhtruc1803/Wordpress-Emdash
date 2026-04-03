"use client";

import Link from "next/link";

import { getProjectNavigation } from "@/components/app-shell/navigation";
import { useLocale } from "@/components/layout/locale-provider";
import { cn } from "@/lib/utils";

export function ProjectWorkspaceNav({
  projectId,
  projectName
}: {
  projectId: string;
  projectName: string;
}) {
  const { locale } = useLocale();
  const projectNavigation = getProjectNavigation(locale);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {projectNavigation.map((item) => (
            <Link
              key={item.segment}
              href={`/app/projects/${projectId}/${item.segment}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
        {locale === "vi" ? "Workspace dự án" : "Project workspace"}: {projectName}
      </div>
    </>
  );
}
