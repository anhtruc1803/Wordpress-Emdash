import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SupportedLocale } from "@/lib/i18n/ui";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string, locale: SupportedLocale = "vi"): string {
  if (!value) {
    return locale === "vi" ? "Không có dữ liệu" : "No data";
  }

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatCount(value: number, locale: SupportedLocale = "vi"): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value);
}

export function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
