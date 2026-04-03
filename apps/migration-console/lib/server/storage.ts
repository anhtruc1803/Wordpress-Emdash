import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const repoRoot = resolve(process.cwd(), "../..");
const consoleDataRoot = join(repoRoot, ".console-data");
const projectRoot = join(consoleDataRoot, "projects");

export function getRepoRoot(): string {
  return repoRoot;
}

export function getConsoleDataRoot(): string {
  return consoleDataRoot;
}

export function getProjectRoot(): string {
  return projectRoot;
}

export function getProjectDir(projectId: string): string {
  return join(projectRoot, projectId);
}

export function getProjectManifestPath(projectId: string): string {
  return join(getProjectDir(projectId), "project.json");
}

export function getProjectWorkspacePath(projectId: string): string {
  return join(getProjectDir(projectId), "workspace.json");
}

export function getProjectActivityPath(projectId: string): string {
  return join(getProjectDir(projectId), "activity.json");
}

export function getProjectManualFixStatePath(projectId: string): string {
  return join(getProjectDir(projectId), "manual-fixes-state.json");
}

export function getProjectTargetSecretPath(projectId: string): string {
  return join(getProjectDir(projectId), "target-secret.json");
}

export function getProjectSourceDir(projectId: string): string {
  return join(getProjectDir(projectId), "source");
}

export function getProjectRunDir(projectId: string, runLabel: string): string {
  return join(getProjectDir(projectId), "runs", runLabel);
}

export async function ensureStorage(): Promise<void> {
  await mkdir(projectRoot, { recursive: true });
}
