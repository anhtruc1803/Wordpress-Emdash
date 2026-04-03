import type {
  ActionResponse,
  DashboardResponse,
  ManualFixUpdateInput,
  ProjectCreateInput,
  ProjectCreateResponse,
  ProjectsResponse,
  WorkspaceResponse
} from "@/lib/types/api";

import { readJsonOrThrow } from "./http";

export async function fetchDashboard(): Promise<DashboardResponse["dashboard"]> {
  return (await readJsonOrThrow<DashboardResponse>(await fetch("/api/dashboard", { cache: "no-store" }))).dashboard;
}

export async function fetchProjects(): Promise<ProjectsResponse["projects"]> {
  return (await readJsonOrThrow<ProjectsResponse>(await fetch("/api/projects", { cache: "no-store" }))).projects;
}

export async function fetchWorkspace(projectId: string): Promise<WorkspaceResponse["workspace"]> {
  return (
    await readJsonOrThrow<WorkspaceResponse>(
      await fetch(`/api/projects/${projectId}/workspace`, {
        cache: "no-store"
      })
    )
  ).workspace;
}

export async function createProject(payload: FormData | ProjectCreateInput): Promise<ProjectCreateResponse["project"]> {
  const response = await fetch("/api/projects", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    headers: payload instanceof FormData ? undefined : { "Content-Type": "application/json" }
  });

  return (await readJsonOrThrow<ProjectCreateResponse>(response)).project;
}

export async function runAudit(projectId: string): Promise<ActionResponse["workspace"]> {
  return (
    await readJsonOrThrow<ActionResponse>(
      await fetch(`/api/projects/${projectId}/actions/audit`, {
        method: "POST"
      })
    )
  ).workspace;
}

export async function runDryRun(projectId: string): Promise<ActionResponse["workspace"]> {
  return (
    await readJsonOrThrow<ActionResponse>(
      await fetch(`/api/projects/${projectId}/actions/dry-run`, {
        method: "POST"
      })
    )
  ).workspace;
}

export async function testSource(projectId: string): Promise<ActionResponse["project"]> {
  return (
    await readJsonOrThrow<ActionResponse>(
      await fetch(`/api/projects/${projectId}/actions/source-test`, {
        method: "POST"
      })
    )
  ).project;
}

export async function updateManualFix(
  projectId: string,
  fixId: string,
  payload: ManualFixUpdateInput
): Promise<ActionResponse["workspace"]> {
  return (
    await readJsonOrThrow<ActionResponse>(
      await fetch(`/api/projects/${projectId}/manual-fixes/${fixId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
    )
  ).workspace;
}

export async function updateProjectSettings(projectId: string, payload: Record<string, unknown>): Promise<ActionResponse["project"]> {
  return (
    await readJsonOrThrow<ActionResponse>(
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
    )
  ).project;
}
