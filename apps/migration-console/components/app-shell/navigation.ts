import type { SupportedLocale } from "@/lib/i18n/ui";
import type { ProjectStatus } from "@/lib/types/ui";

import {
  Boxes,
  FileOutput,
  Files,
  FlaskConical,
  FolderKanban,
  Gauge,
  ScanSearch,
  Settings,
  Unplug,
  WandSparkles
} from "lucide-react";

export function getPrimaryNavigation(locale: SupportedLocale) {
  return [
    { href: "/app/dashboard", label: locale === "vi" ? "Tổng quan" : "Dashboard", icon: Gauge },
    { href: "/app/projects", label: locale === "vi" ? "Dự án" : "Projects", icon: FolderKanban },
    { href: "/app/projects/new", label: locale === "vi" ? "Dự án mới" : "New Project", icon: Files }
  ];
}

export function getProjectNavigation(locale: SupportedLocale) {
  return [
    { segment: "overview", label: locale === "vi" ? "Tổng quan" : "Overview", icon: Gauge },
    { segment: "source", label: locale === "vi" ? "Nguồn dữ liệu" : "Source", icon: Unplug },
    { segment: "audit", label: "Audit", icon: ScanSearch },
    { segment: "dry-run", label: locale === "vi" ? "Chạy thử" : "Dry Run", icon: FlaskConical },
    { segment: "manual-fixes", label: locale === "vi" ? "Chỉnh sửa thủ công" : "Manual Fixes", icon: WandSparkles },
    { segment: "transform-preview", label: locale === "vi" ? "Xem trước transform" : "Transform Preview", icon: Boxes },
    { segment: "import-plan", label: locale === "vi" ? "Kế hoạch import" : "Import Plan", icon: FileOutput },
    { segment: "artifacts", label: locale === "vi" ? "Tệp đầu ra" : "Artifacts", icon: Files },
    { segment: "settings", label: locale === "vi" ? "Thiết lập" : "Settings", icon: Settings }
  ];
}

export const projectStatusOrder: ProjectStatus[] = [
  "Draft",
  "Source Connected",
  "Audited",
  "Dry Run Complete",
  "Ready for Import",
  "Blocked"
];
