"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Search } from "lucide-react";

import { useLocale } from "@/components/layout/locale-provider";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";
import { getPrimaryNavigation } from "./navigation";

export function AppShell({
  children,
  title = "WordPress to EmDash Migration Console",
  subtitle
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const primaryNavigation = getPrimaryNavigation(locale);
  const resolvedSubtitle =
    subtitle ??
    (locale === "vi"
      ? "Không gian làm việc để audit, chuyển đổi và lập kế hoạch migration cho các nhóm kỹ thuật."
      : "A workspace for auditing, transforming, and planning migrations for technical teams.");

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-line bg-slate-950 px-5 py-6 text-slate-200">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              Migration Console
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="text-sm leading-6 text-slate-400">{resolvedSubtitle}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {primaryNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    isActive ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {locale === "vi" ? "Vì sao giao diện này tồn tại" : "Why this UI exists"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {locale === "vi"
                ? "Console này là không gian làm việc để soi rủi ro, rà soát transform và chuẩn bị handoff migration. Nó không phải công cụ import một chạm."
                : "This console is a workspace for risk review, transform inspection, and migration handoff. It is not a one-click import tool."}
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 text-muted" />
                <span className="text-sm text-muted">
                  {locale === "vi" ? "Tìm dự án, vấn đề hoặc mục nội dung" : "Search projects, issues, or content items"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LocaleSwitcher />
                <div className="rounded-full border border-line bg-white p-2 shadow-sm">
                  <Bell className="h-4 w-4 text-slate-700" />
                </div>
                <div className="hidden rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm sm:block">
                  {locale === "vi" ? "Không gian nội bộ" : "Internal Workspace"}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
