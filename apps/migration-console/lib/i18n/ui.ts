import type {
  ActivityEvent,
  ManualFixStatus,
  ProjectStatus,
  RecommendationLabel,
  SourceValidationState,
  UiSeverity
} from "@/lib/types/ui";

export type SupportedLocale = "vi" | "en";

export const DEFAULT_LOCALE: SupportedLocale = "vi";
export const LOCALE_STORAGE_KEY = "wp2emdash.locale";
export const LOCALE_COOKIE_KEY = "wp2emdash-locale";

const severityLabels: Record<SupportedLocale, Record<UiSeverity, string>> = {
  vi: {
    info: "Thông tin",
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao"
  },
  en: {
    info: "Info",
    low: "Low",
    medium: "Medium",
    high: "High"
  }
};

const statusLabels: Record<SupportedLocale, Record<ProjectStatus, string>> = {
  vi: {
    Draft: "Bản nháp",
    "Source Connected": "Đã kết nối nguồn",
    Audited: "Đã audit",
    "Dry Run Complete": "Đã chạy thử",
    "Ready for Import": "Sẵn sàng import",
    Blocked: "Đang bị chặn"
  },
  en: {
    Draft: "Draft",
    "Source Connected": "Source Connected",
    Audited: "Audited",
    "Dry Run Complete": "Dry Run Complete",
    "Ready for Import": "Ready for Import",
    Blocked: "Blocked"
  }
};

const recommendationLabels: Record<SupportedLocale, Record<RecommendationLabel, string>> = {
  vi: {
    Ready: "Sẵn sàng",
    "Cleanup Needed": "Cần dọn thủ công",
    "Rebuild Recommended": "Nên dựng lại"
  },
  en: {
    Ready: "Ready",
    "Cleanup Needed": "Cleanup Needed",
    "Rebuild Recommended": "Rebuild Recommended"
  }
};

const validationStateLabels: Record<SupportedLocale, Record<SourceValidationState, string>> = {
  vi: {
    unknown: "Chưa rõ",
    valid: "Hợp lệ",
    invalid: "Không hợp lệ"
  },
  en: {
    unknown: "Unknown",
    valid: "Valid",
    invalid: "Invalid"
  }
};

const manualFixStatusLabels: Record<SupportedLocale, Record<ManualFixStatus, string>> = {
  vi: {
    open: "Đang mở",
    in_review: "Đang rà soát",
    resolved: "Đã xử lý"
  },
  en: {
    open: "Open",
    in_review: "In review",
    resolved: "Resolved"
  }
};

const difficultyLevelLabels = {
  vi: {
    Low: "Thấp",
    Medium: "Trung bình",
    High: "Cao"
  },
  en: {
    Low: "Low",
    Medium: "Medium",
    High: "High"
  }
} as const;

const sourceKindLabels = {
  vi: {
    wxr: "Tệp WXR",
    api: "REST API"
  },
  en: {
    wxr: "WXR File",
    api: "REST API"
  }
} as const;

const artifactLabels = {
  vi: {
    outputDir: "Thư mục đầu ra",
    auditResultPath: "JSON audit",
    transformPreviewPath: "JSON xem trước transform",
    importPlanPath: "JSON import plan",
    importResultPath: "JSON kết quả import",
    migrationReportPath: "Báo cáo Markdown",
    manualFixesCsvPath: "CSV chỉnh sửa thủ công",
    summaryPath: "JSON tóm tắt"
  },
  en: {
    outputDir: "Output directory",
    auditResultPath: "Audit JSON",
    transformPreviewPath: "Transform preview JSON",
    importPlanPath: "Import plan JSON",
    importResultPath: "Import result JSON",
    migrationReportPath: "Migration report Markdown",
    manualFixesCsvPath: "Manual fixes CSV",
    summaryPath: "Summary JSON"
  }
} as const;

const bidirectionalMessages: Array<{ en: string; vi: string }> = [
  { en: "Source validated successfully.", vi: "Nguồn dữ liệu đã được xác thực thành công." },
  { en: "Source validated during audit.", vi: "Nguồn dữ liệu đã được xác thực trong lúc chạy audit." },
  { en: "Source validated during dry run.", vi: "Nguồn dữ liệu đã được xác thực trong lúc chạy dry run." },
  { en: "Project settings updated.", vi: "Thiết lập dự án đã được cập nhật." },
  { en: "No validation message yet", vi: "Chưa có ghi chú xác thực." },
  { en: "Not configured", vi: "Chưa cấu hình" },
  { en: "Not checked yet", vi: "Chưa kiểm tra" },
  { en: "Not run", vi: "Chưa chạy" },
  { en: "No run output yet", vi: "Chưa có đầu ra từ lần chạy nào" },
  { en: "Source connection validated.", vi: "Đã xác thực kết nối nguồn dữ liệu." },
  { en: "Unknown source validation error", vi: "Lỗi xác thực nguồn dữ liệu không xác định" },
  { en: "Source is not configured for this project.", vi: "Dự án này chưa được cấu hình nguồn dữ liệu." },
  { en: "Configure a source before running audit.", vi: "Hãy cấu hình nguồn dữ liệu trước khi chạy audit." },
  { en: "Configure a source before running a dry run.", vi: "Hãy cấu hình nguồn dữ liệu trước khi chạy dry run." },
  {
    en: "Review shortcode behavior and replace it with a structured equivalent or editorial rewrite.",
    vi: "Rà soát hành vi shortcode và thay nó bằng một cấu trúc tương đương hoặc nội dung biên tập lại."
  },
  {
    en: "Rebuild the unsupported block manually and preserve the raw payload for reference.",
    vi: "Dựng lại block chưa hỗ trợ bằng tay và giữ raw payload để đối chiếu."
  },
  {
    en: "Treat as a blocking issue and replace any script-driven behavior with a safe target implementation.",
    vi: "Xem đây là vấn đề chặn và thay mọi hành vi phụ thuộc script bằng cách triển khai an toàn ở target."
  },
  {
    en: "Confirm target embed support and replace legacy embed markup where needed.",
    vi: "Xác nhận target có hỗ trợ embed hay không và thay phần markup embed cũ khi cần."
  },
  {
    en: "Inspect the item and decide whether to keep, rebuild, or remove the source construct.",
    vi: "Kiểm tra mục này và quyết định nên giữ lại, dựng lại hay loại bỏ cấu trúc nguồn."
  },
  {
    en: "Untitled item",
    vi: "Mục chưa có tiêu đề"
  }
];

function translateBidirectional(message: string, locale: SupportedLocale): string {
  const known = bidirectionalMessages.find((entry) => entry.en === message || entry.vi === message);
  if (!known) {
    return message;
  }

  return locale === "vi" ? known.vi : known.en;
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export function translateSeverity(severity: UiSeverity, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return severityLabels[locale][severity];
}

export function translateProjectStatus(status: ProjectStatus, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return statusLabels[locale][status];
}

export function translateRecommendation(recommendation?: RecommendationLabel, locale: SupportedLocale = DEFAULT_LOCALE): string {
  if (!recommendation) {
    return locale === "vi" ? "Chờ xử lý" : "Pending";
  }

  return recommendationLabels[locale][recommendation];
}

export function translateSourceValidationState(state: SourceValidationState, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return validationStateLabels[locale][state];
}

export function translateManualFixStatus(status: ManualFixStatus, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return manualFixStatusLabels[locale][status];
}

export function translateDifficultyLevel(level: "Low" | "Medium" | "High", locale: SupportedLocale = DEFAULT_LOCALE): string {
  return difficultyLevelLabels[locale][level];
}

export function translateSourceKind(kind: "wxr" | "api", locale: SupportedLocale = DEFAULT_LOCALE): string {
  return sourceKindLabels[locale][kind];
}

export function translateArtifactKey(key: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return artifactLabels[locale][key as keyof typeof artifactLabels.vi] ?? key;
}

export function translateManualRecommendation(recommendation: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  return translateBidirectional(recommendation, locale);
}

export function translateValidationMessage(message?: string, locale: SupportedLocale = DEFAULT_LOCALE): string | undefined {
  if (!message) {
    return message;
  }

  return translateBidirectional(message, locale);
}

export function translateDifficultyReason(reason: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  if (locale !== "vi") {
    return reason;
  }

  let match = reason.match(/^(\d+) unsupported block\(s\) need fallback handling\.$/);
  if (match) {
    return `${match[1]} block không được hỗ trợ cần có fallback để xử lý.`;
  }

  match = reason.match(/^(\d+) shortcode occurrence\(s\) require manual review\.$/);
  if (match) {
    return `${match[1]} shortcode cần được rà soát thủ công.`;
  }

  match = reason.match(/^Builder\/plugin heuristics detected (\d+) migration-sensitive system\(s\)\.$/);
  if (match) {
    return `Heuristic đã phát hiện ${match[1]} builder hoặc plugin nhạy cảm với migration.`;
  }

  match = reason.match(/^(\d+) raw HTML block\(s\) were preserved instead of fully converted\.$/);
  if (match) {
    return `${match[1]} block HTML thô được giữ nguyên thay vì chuyển đổi hoàn toàn.`;
  }

  match = reason.match(/^(\d+) embed\/iframe instance\(s\) may need target-specific handling\.$/);
  if (match) {
    return `${match[1]} embed hoặc iframe có thể cần xử lý riêng theo target.`;
  }

  match = reason.match(/^(\d+) script fragment\(s\) are considered high risk\.$/);
  if (match) {
    return `${match[1]} đoạn script được xem là rủi ro cao.`;
  }

  match = reason.match(/^(\d+) custom post type\(s\) need collection mapping decisions\.$/);
  if (match) {
    return `${match[1]} custom post type cần quyết định mapping sang collection đích.`;
  }

  match = reason.match(/^(\d+) item\(s\) still contain migration warnings\.$/);
  if (match) {
    return `${match[1]} mục vẫn còn cảnh báo migration.`;
  }

  return reason;
}

export function translateActivityMessage(event: ActivityEvent, locale: SupportedLocale = DEFAULT_LOCALE): string {
  switch (event.type) {
    case "project_created":
      return locale === "vi" ? "Đã tạo dự án migration." : "Migration project created.";
    case "source_validated":
      return locale === "vi" ? "Đã xác thực nguồn dữ liệu." : "Source validated.";
    case "audit_run":
      return locale === "vi" ? "Đã chạy audit." : "Audit completed.";
    case "dry_run":
      return locale === "vi" ? "Đã chạy thử dry run." : "Dry run completed.";
    case "import_run":
      return locale === "vi" ? "Đã chạy import sang EmDash." : "Import completed.";
    case "settings_updated":
      return locale === "vi" ? "Đã cập nhật thiết lập hoặc ghi chú." : "Settings or notes updated.";
    default:
      return event.message;
  }
}
