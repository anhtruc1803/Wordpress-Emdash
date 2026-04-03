import type { DashboardData, ManualFixUpdateInput, ProjectCreateInput, ProjectRecord, WorkspaceView } from "./ui";

export interface ProjectCreateResponse {
  project: ProjectRecord;
}

export interface ProjectsResponse {
  projects: ProjectRecord[];
}

export interface WorkspaceResponse {
  workspace: WorkspaceView;
}

export interface DashboardResponse {
  dashboard: DashboardData;
}

export interface ActionResponse {
  project: ProjectRecord;
  workspace: WorkspaceView;
}

export type { ManualFixUpdateInput, ProjectCreateInput };
