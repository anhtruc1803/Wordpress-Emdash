import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, join, resolve } from "node:path";

import type { SourceKind } from "@wp2emdash/shared-types";

import { executeAudit, executeDryRun, loadSourceBundle } from "@wp2emdash/migration-core";

import type {
  ActivityEvent,
  DashboardData,
  ManualFixUpdateInput,
  MigrationSourceConfig,
  ProjectCreateInput,
  ProjectRecord,
  WorkspaceSnapshot,
  WorkspaceView
} from "@/lib/types/ui";

import { slugify } from "@/lib/utils";
import {
  buildWorkspaceView,
  determineProjectStatus,
  type ManualFixStateMap
} from "./workspace-view";
import {
  ensureStorage,
  getProjectActivityPath,
  getProjectDir,
  getProjectManualFixStatePath,
  getProjectManifestPath,
  getProjectRoot,
  getProjectRunDir,
  getProjectSourceDir,
  getProjectWorkspacePath,
  getRepoRoot
} from "./storage";

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function ensureProjectDirectories(projectId: string): Promise<void> {
  await mkdir(getProjectDir(projectId), { recursive: true });
  await mkdir(getProjectSourceDir(projectId), { recursive: true });
}

function nowIso(): string {
  return new Date().toISOString();
}

function createProjectId(name: string): string {
  return `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function appendActivity(projectId: string, event: Omit<ActivityEvent, "id">): Promise<void> {
  const activities = await readJson<ActivityEvent[]>(getProjectActivityPath(projectId), []);
  activities.push({
    id: `${event.type}-${Date.now()}`,
    ...event
  });
  await writeJson(getProjectActivityPath(projectId), activities);
}

async function saveProject(project: ProjectRecord): Promise<void> {
  await writeJson(getProjectManifestPath(project.id), project);
}

async function saveWorkspace(projectId: string, snapshot: WorkspaceSnapshot): Promise<void> {
  await writeJson(getProjectWorkspacePath(projectId), snapshot);
}

async function loadProject(projectId: string): Promise<ProjectRecord> {
  const project = await readJson<ProjectRecord | null>(getProjectManifestPath(projectId), null);
  if (!project) {
    throw new Error(`Project ${projectId} was not found.`);
  }

  return project;
}

async function loadWorkspaceSnapshot(projectId: string): Promise<WorkspaceSnapshot> {
  return readJson<WorkspaceSnapshot>(getProjectWorkspacePath(projectId), {});
}

async function loadManualFixState(projectId: string): Promise<ManualFixStateMap> {
  return readJson<ManualFixStateMap>(getProjectManualFixStatePath(projectId), {});
}

async function saveManualFixState(projectId: string, state: ManualFixStateMap): Promise<void> {
  await writeJson(getProjectManualFixStatePath(projectId), state);
}

async function loadActivity(projectId: string): Promise<ActivityEvent[]> {
  return readJson<ActivityEvent[]>(getProjectActivityPath(projectId), []);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function createProject(params: {
  name: string;
  source: MigrationSourceConfig | null;
}): Promise<ProjectRecord> {
  await ensureStorage();

  const id = createProjectId(params.name);
  await ensureProjectDirectories(id);

  const project: ProjectRecord = {
    id,
    name: params.name,
    status: params.source ? "Source Connected" : "Draft",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    source: params.source,
    sourceValidation: {
      state: params.source ? "unknown" : "unknown"
    }
  };

  await saveProject(project);
  await appendActivity(id, {
    type: "project_created",
    message: `Đã tạo dự án ${params.name}.`,
    at: nowIso()
  });

  return project;
}

export async function createProjectFromInput(
  input: ProjectCreateInput,
  uploadedFile?: { name: string; buffer: Buffer }
): Promise<ProjectRecord> {
  let source: MigrationSourceConfig | null = null;

  if (input.sourceKind === "api" && input.sourceUrl) {
    source = {
      kind: "api",
      input: input.sourceUrl,
      baseUrl: input.sourceUrl,
      label: input.sourceUrl
    };
  }

  const project = await createProject({
    name: input.name,
    source
  });

  if (input.sourceKind === "wxr" && uploadedFile) {
    const sourceDir = getProjectSourceDir(project.id);
    await mkdir(sourceDir, { recursive: true });
    const destinationPath = join(sourceDir, uploadedFile.name);
    await writeFile(destinationPath, uploadedFile.buffer);
    const updatedProject: ProjectRecord = {
      ...project,
      source: {
        kind: "wxr",
        input: destinationPath,
        fileName: uploadedFile.name,
        label: uploadedFile.name
      },
      updatedAt: nowIso()
    };
    await saveProject(updatedProject);
    return updatedProject;
  }

  return project;
}

export async function updateProject(projectId: string, patch: Partial<ProjectRecord>): Promise<ProjectRecord> {
  const current = await loadProject(projectId);
  const updated = {
    ...current,
    ...patch,
    updatedAt: nowIso()
  };
  await saveProject(updated);
  await appendActivity(projectId, {
    type: "settings_updated",
    message: "Thiết lập dự án đã được cập nhật.",
    at: nowIso()
  });
  return updated;
}

export async function testProjectSource(projectId: string): Promise<ProjectRecord> {
  const project = await loadProject(projectId);
  if (!project.source) {
    throw new Error("Dự án này chưa được cấu hình nguồn dữ liệu.");
  }

  try {
    await loadSourceBundle({
      sourceKind: project.source.kind as SourceKind,
      input: project.source.input
    });
    const updated: ProjectRecord = {
      ...project,
      sourceValidation: {
        state: "valid",
        checkedAt: nowIso(),
        message: "Nguồn dữ liệu đã được xác thực thành công."
      },
      updatedAt: nowIso()
    };
    await saveProject(updated);
    await appendActivity(projectId, {
      type: "source_validated",
      message: "Đã xác thực kết nối nguồn dữ liệu.",
      at: nowIso()
    });
    return updated;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi xác thực nguồn dữ liệu không xác định";
    const updated: ProjectRecord = {
      ...project,
      sourceValidation: {
        state: "invalid",
        checkedAt: nowIso(),
        message
      },
      updatedAt: nowIso()
    };
    await saveProject(updated);
    return updated;
  }
}

export async function runProjectAudit(projectId: string): Promise<WorkspaceView> {
  const project = await loadProject(projectId);
  if (!project.source) {
    throw new Error("Hãy cấu hình nguồn dữ liệu trước khi chạy audit.");
  }

  const outputDir = getProjectRunDir(projectId, `audit-${Date.now()}`);
  const result = await executeAudit({
    input: project.source.input,
    sourceKind: project.source.kind,
    outputDir
  });

  const snapshot: WorkspaceSnapshot = {
    bundle: result.bundle,
    auditResult: result.auditResult,
    summary: result.summary,
    artifacts: result.summary.outputs
  };

  await saveWorkspace(projectId, snapshot);

  const emptyState: ManualFixStateMap = {};
  await saveManualFixState(projectId, emptyState);
  const provisionalView = buildWorkspaceView(project, snapshot, emptyState, await loadActivity(projectId));

  const updatedProject: ProjectRecord = {
    ...project,
    sourceValidation: {
      state: "valid",
      checkedAt: nowIso(),
      message: "Nguồn dữ liệu đã được xác thực trong lúc chạy audit."
    },
    latestAuditAt: nowIso(),
    latestSummary: result.summary,
    difficulty: result.auditResult.difficulty,
    recommendation: provisionalView.project.recommendation,
    status: determineProjectStatus(project, snapshot, provisionalView.manualFixes),
    updatedAt: nowIso()
  };
  await saveProject(updatedProject);
  await appendActivity(projectId, {
    type: "audit_run",
    message: `Đã hoàn tất audit cho ${result.bundle.site.name}.`,
    at: nowIso()
  });

  return getWorkspaceView(projectId);
}

export async function runProjectDryRun(projectId: string): Promise<WorkspaceView> {
  const project = await loadProject(projectId);
  if (!project.source) {
    throw new Error("Hãy cấu hình nguồn dữ liệu trước khi chạy dry run.");
  }

  const outputDir = getProjectRunDir(projectId, `dry-run-${Date.now()}`);
  const result = await executeDryRun({
    input: project.source.input,
    sourceKind: project.source.kind,
    outputDir
  });

  const snapshot: WorkspaceSnapshot = {
    bundle: result.bundle,
    auditResult: result.auditResult,
    transformResults: result.transformResults,
    importPlan: await readJson(join(outputDir, "import-plan.json"), undefined),
    summary: result.summary,
    artifacts: result.summary.outputs
  };

  await saveWorkspace(projectId, snapshot);

  const existingState = await loadManualFixState(projectId);
  await saveManualFixState(projectId, existingState);

  const provisionalView = buildWorkspaceView(project, snapshot, existingState, await loadActivity(projectId));

  const updatedProject: ProjectRecord = {
    ...project,
    sourceValidation: {
      state: "valid",
      checkedAt: nowIso(),
      message: "Nguồn dữ liệu đã được xác thực trong lúc chạy dry run."
    },
    latestAuditAt: nowIso(),
    latestDryRunAt: nowIso(),
    latestSummary: result.summary,
    difficulty: result.auditResult.difficulty,
    recommendation: provisionalView.project.recommendation,
    status: determineProjectStatus(project, snapshot, provisionalView.manualFixes),
    updatedAt: nowIso()
  };
  await saveProject(updatedProject);
  await appendActivity(projectId, {
    type: "dry_run",
    message: `Đã hoàn tất dry run với ${provisionalView.manualFixes.length} mục chỉnh sửa thủ công.`,
    at: nowIso()
  });

  return getWorkspaceView(projectId);
}

export async function listProjects(): Promise<ProjectRecord[]> {
  await ensureStorage();
  await ensureDemoProject();
  const entries = await readdir(getProjectRoot(), { withFileTypes: true });
  const projects = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => readJson<ProjectRecord | null>(getProjectManifestPath(entry.name), null))
  );

  return projects
    .filter((project): project is ProjectRecord => Boolean(project))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getWorkspaceView(projectId: string): Promise<WorkspaceView> {
  const project = await loadProject(projectId);
  const snapshot = await loadWorkspaceSnapshot(projectId);
  const state = await loadManualFixState(projectId);
  const activity = await loadActivity(projectId);
  return buildWorkspaceView(project, snapshot, state, activity);
}

export async function updateManualFix(projectId: string, fixId: string, patch: ManualFixUpdateInput): Promise<WorkspaceView> {
  const state = await loadManualFixState(projectId);
  state[fixId] = {
    status: patch.status ?? state[fixId]?.status ?? "open",
    notes: patch.notes ?? state[fixId]?.notes,
    assignee: patch.assignee ?? state[fixId]?.assignee
  };
  await saveManualFixState(projectId, state);
  await appendActivity(projectId, {
    type: "settings_updated",
    message: `Đã cập nhật mục chỉnh sửa thủ công ${fixId}.`,
    at: nowIso()
  });
  return getWorkspaceView(projectId);
}

export async function getDashboardData(): Promise<DashboardData> {
  const projects = await listProjects();
  const workspaces = await Promise.all(projects.map((project) => getWorkspaceView(project.id)));

  const statusCounts = new Map<ProjectRecord["status"], number>();
  const riskCounts = new Map<string, number>();
  const activities = workspaces.flatMap((workspace) => workspace.activity.slice(0, 3));

  let openManualFixes = 0;
  let blockedProjects = 0;
  let readyProjects = 0;

  for (const workspace of workspaces) {
    statusCounts.set(workspace.project.status, (statusCounts.get(workspace.project.status) ?? 0) + 1);
    openManualFixes += workspace.manualFixes.filter((fix) => fix.status !== "resolved").length;
    if (workspace.project.status === "Blocked") {
      blockedProjects += 1;
    }
    if (workspace.project.status === "Ready for Import") {
      readyProjects += 1;
    }

    for (const risk of workspace.riskBreakdown) {
      riskCounts.set(risk.severity, (riskCounts.get(risk.severity) ?? 0) + risk.count);
    }
  }

  return {
    totalProjects: projects.length,
    openManualFixes,
    blockedProjects,
    readyProjects,
    statusBreakdown: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    riskDistribution: Array.from(riskCounts.entries()).map(([severity, count]) => ({
      severity: severity as DashboardData["riskDistribution"][number]["severity"],
      count
    })),
    recentActivity: activities.sort((left, right) => right.at.localeCompare(left.at)).slice(0, 8),
    recentProjects: projects.slice(0, 6)
  };
}

export async function ensureDemoProject(): Promise<void> {
  const entries = await readdir(getProjectRoot(), { withFileTypes: true }).catch(() => []);
  if (entries.some((entry) => entry.isDirectory())) {
    return;
  }

  const fixturePath = resolve(getRepoRoot(), "packages/test-fixtures/fixtures/sample-wxr.xml");
  if (!(await fileExists(fixturePath))) {
    return;
  }

  const project = await createProject({
    name: "Migration WordPress mẫu",
    source: {
      kind: "wxr",
      input: fixturePath,
      fileName: basename(fixturePath),
      label: "Fixture WXR mẫu"
    }
  });

  await testProjectSource(project.id);
  await runProjectDryRun(project.id);
}
