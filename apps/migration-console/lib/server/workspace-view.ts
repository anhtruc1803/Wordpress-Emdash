import type { AuditIssue, TransformWarning, WordPressContentItem } from "@wp2emdash/shared-types";

import type {
  ActivityEvent,
  ManualFixRow,
  ManualFixStatus,
  ProjectRecord,
  ProjectStatus,
  RecommendationLabel,
  UiSeverity,
  WorkspaceSnapshot,
  WorkspaceView
} from "@/lib/types/ui";

import { slugify } from "@/lib/utils";

export interface ManualFixState {
  status: ManualFixStatus;
  notes?: string;
  assignee?: string;
}

export type ManualFixStateMap = Record<string, ManualFixState>;

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function createFixId(sourceId: string, reason: string, detail: string): string {
  return slugify(`${sourceId}-${reason}-${hashString(detail)}`);
}

function mapIssueSeverity(reason: string, detail: string): UiSeverity {
  const haystack = `${reason} ${detail}`.toLowerCase();
  if (haystack.includes("script")) {
    return "high";
  }

  if (haystack.includes("unsupported") || haystack.includes("shortcode") || haystack.includes("embed")) {
    return "medium";
  }

  if (haystack.includes("raw") || haystack.includes("html")) {
    return "low";
  }

  return "info";
}

function manualRecommendation(reason: string): string {
  const key = reason.toLowerCase();
  if (key.includes("shortcode")) {
    return "Rà soát hành vi shortcode và thay nó bằng một cấu trúc tương đương hoặc nội dung biên tập lại.";
  }

  if (key.includes("unsupported")) {
    return "Dựng lại block chưa hỗ trợ bằng tay và giữ raw payload để đối chiếu.";
  }

  if (key.includes("script")) {
    return "Xem đây là vấn đề chặn và thay mọi hành vi phụ thuộc script bằng cách triển khai an toàn ở target.";
  }

  if (key.includes("embed")) {
    return "Xác nhận target có hỗ trợ embed hay không và thay phần markup embed cũ khi cần.";
  }

  return "Kiểm tra mục này và quyết định nên giữ lại, dựng lại hay loại bỏ cấu trúc nguồn.";
}

function findTitle(item?: WordPressContentItem): string {
  return item?.title || "Mục chưa có tiêu đề";
}

function buildManualFixRows(project: ProjectRecord, snapshot: WorkspaceSnapshot, stateMap: ManualFixStateMap): ManualFixRow[] {
  const bundleItems = new Map((snapshot.bundle?.contentItems ?? []).map((item) => [item.id, item]));
  const fromPlan = snapshot.importPlan?.manualFixes ?? [];
  const fromAudit =
    fromPlan.length === 0
      ? (snapshot.auditResult?.unsupportedItems ?? []).map((issue) => ({
          sourceId: issue.itemId,
          sourceType: issue.itemType,
          reason: issue.reason,
          detail: issue.detail
        }))
      : [];

  return [...fromPlan, ...fromAudit].map((record) => {
    const item = bundleItems.get(record.sourceId);
    const id = createFixId(record.sourceId, record.reason, record.detail);
    const saved = stateMap[id];

    return {
      id,
      sourceId: record.sourceId,
      sourceType: record.sourceType,
      title: findTitle(item),
      issueType: record.reason,
      severity: mapIssueSeverity(record.reason, record.detail),
      recommendation: manualRecommendation(record.reason),
      status: saved?.status ?? "open",
      notes: saved?.notes,
      assignee: saved?.assignee,
      detail: record.detail
    };
  });
}

function buildItems(snapshot: WorkspaceSnapshot, manualFixes: ManualFixRow[]) {
  const fixesByItemId = new Map<string, ManualFixRow[]>();
  for (const fix of manualFixes) {
    const current = fixesByItemId.get(fix.sourceId) ?? [];
    current.push(fix);
    fixesByItemId.set(fix.sourceId, current);
  }

  const transformById = new Map((snapshot.transformResults ?? []).map((result) => [result.itemId, result]));
  return (snapshot.bundle?.contentItems ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    slug: item.slug,
    status: item.status,
    sourceUrl: item.sourceUrl,
    rawContent: item.rawContent,
    transform: transformById.get(item.id),
    manualFixes: fixesByItemId.get(item.id) ?? []
  }));
}

function countSeverity(warnings: TransformWarning[] = [], issues: AuditIssue[] = []): Array<{ severity: UiSeverity; count: number }> {
  const counts: Record<UiSeverity, number> = {
    info: 0,
    low: 0,
    medium: 0,
    high: 0
  };

  for (const warning of warnings) {
    if (warning.severity === "error") {
      counts.high += 1;
    } else if (warning.severity === "warning") {
      counts.medium += 1;
    } else {
      counts.info += 1;
    }
  }

  for (const issue of issues) {
    const mapped = mapIssueSeverity(issue.reason, issue.detail);
    counts[mapped] += 1;
  }

  return Object.entries(counts)
    .map(([severity, count]) => ({ severity: severity as UiSeverity, count }))
    .filter((entry) => entry.count > 0);
}

export function mapRecommendationLabel(value?: string): RecommendationLabel | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "ready for import") {
    return "Ready";
  }

  if (value === "import with manual cleanup") {
    return "Cleanup Needed";
  }

  return "Rebuild Recommended";
}

export function determineProjectStatus(project: ProjectRecord, snapshot: WorkspaceSnapshot, manualFixes: ManualFixRow[]): ProjectStatus {
  const hasSource = Boolean(project.source);
  const hasAudit = Boolean(snapshot.auditResult);
  const hasDryRun = Boolean(snapshot.transformResults && snapshot.importPlan);
  const highSeverityOpenFix = manualFixes.some((fix) => fix.severity === "high" && fix.status !== "resolved");
  const recommendation = snapshot.auditResult?.recommendation;

  if (!hasSource) {
    return "Draft";
  }

  if (highSeverityOpenFix || recommendation === "rebuild recommended") {
    return "Blocked";
  }

  if (hasDryRun && recommendation === "ready for import") {
    return "Ready for Import";
  }

  if (hasDryRun) {
    return "Dry Run Complete";
  }

  if (hasAudit) {
    return "Audited";
  }

  if (project.sourceValidation.state === "valid") {
    return "Source Connected";
  }

  return "Draft";
}

export function buildWorkspaceView(
  project: ProjectRecord,
  snapshot: WorkspaceSnapshot,
  stateMap: ManualFixStateMap,
  activity: ActivityEvent[]
): WorkspaceView {
  const manualFixes = buildManualFixRows(project, snapshot, stateMap);
  const items = buildItems(snapshot, manualFixes);
  const warnings = (snapshot.transformResults ?? []).flatMap((result) => result.warnings);
  const riskBreakdown = countSeverity(warnings, snapshot.auditResult?.unsupportedItems ?? []);

  return {
    project: {
      ...project,
      status: determineProjectStatus(project, snapshot, manualFixes),
      recommendation: mapRecommendationLabel(snapshot.auditResult?.recommendation),
      difficulty: snapshot.auditResult?.difficulty,
      latestSummary: snapshot.summary
    },
    snapshot,
    items,
    manualFixes,
    riskBreakdown,
    activity: activity.sort((left, right) => right.at.localeCompare(left.at))
  };
}
