"use client";

import { Languages } from "lucide-react";

import type { SupportedLocale } from "@/lib/i18n/ui";

import { cn } from "@/lib/utils";
import { useLocale } from "./locale-provider";

const options: Array<{ label: string; value: SupportedLocale }> = [
  { label: "VI", value: "vi" },
  { label: "EN", value: "en" }
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1 shadow-sm" aria-label="language switcher">
      <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{locale === "vi" ? "Ngôn ngữ" : "Language"}</span>
      </div>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            locale === option.value ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
