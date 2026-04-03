import type {
  AuditResult,
  GeneratedArtifacts,
  ImportExecutionResult,
  ImportPlan,
  PipelineArtifactsSummary,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

export type ProjectStatus =
  | "Draft"
  | "Source Connected"
  | "Audited"
  | "Dry Run Complete"
  | "Ready for Import"
  | "Blocked";

export type UiSeverity = "info" | "low" | "medium" | "high";

export type RecommendationLabel = "Ready" | "Cleanup Needed" | "Rebuild Recommended";

export type SourceValidationState = "unknown" | "valid" | "invalid";

export type ManualFixStatus = "open" | "in_review" | "resolved";

export interface EmDashTargetConfig {
  baseUrl: string;
  apiBasePath: string;
  apiTokenConfigured: boolean;
}

export type MigrationSourceConfig =
  | {
      kind: "wxr";
      input: string;
      label: string;
      fileName: string;
    }
  | {
      kind: "api";
      input: string;
      label: string;
      baseUrl: string;
    };

export interface ProjectRecord {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  source: MigrationSourceConfig | null;
  target: EmDashTargetConfig | null;
  sourceValidation: {
    state: SourceValidationState;
    message?: string;
    checkedAt?: string;
  };
  targetValidation: {
    state: SourceValidationState;
    message?: string;
    checkedAt?: string;
  };
  latestAuditAt?: string;
  latestDryRunAt?: string;
  latestImportAt?: string;
  latestSummary?: PipelineArtifactsSummary;
  difficulty?: AuditResult["difficulty"];
  recommendation?: RecommendationLabel;
}

export interface ManualFixRow {
  id: string;
  sourceId: string;
  sourceType: string;
  title: string;
  issueType: string;
  severity: UiSeverity;
  recommendation: string;
  status: ManualFixStatus;
  notes?: string;
  assignee?: string;
  detail: string;
}

export interface MigrationItemDetail {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  sourceUrl?: string;
  rawContent: string;
  transform?: TransformResult;
  manualFixes: ManualFixRow[];
}

export interface WorkspaceSnapshot {
  bundle?: WordPressSourceBundle;
  auditResult?: AuditResult;
  transformResults?: TransformResult[];
  importPlan?: ImportPlan;
  importResult?: ImportExecutionResult;
  summary?: PipelineArtifactsSummary;
  artifacts?: GeneratedArtifacts;
  adapterNote?: string;
}

export interface WorkspaceView {
  project: ProjectRecord;
  snapshot: WorkspaceSnapshot;
  items: MigrationItemDetail[];
  manualFixes: ManualFixRow[];
  riskBreakdown: Array<{ severity: UiSeverity; count: number }>;
  activity: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  type:
    | "project_created"
    | "source_validated"
    | "target_validated"
    | "audit_run"
    | "dry_run"
    | "import_run"
    | "settings_updated";
  message: string;
  at: string;
}

export interface DashboardData {
  totalProjects: number;
  openManualFixes: number;
  blockedProjects: number;
  readyProjects: number;
  statusBreakdown: Array<{ status: ProjectStatus; count: number }>;
  riskDistribution: Array<{ severity: UiSeverity; count: number }>;
  recentActivity: ActivityEvent[];
  recentProjects: ProjectRecord[];
}

export interface ProjectCreateInput {
  name: string;
  sourceKind: "wxr" | "api";
  sourceUrl?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  target?: {
    baseUrl?: string;
    apiToken?: string;
  };
}

export interface ManualFixUpdateInput {
  status?: ManualFixStatus;
  notes?: string;
  assignee?: string;
}
