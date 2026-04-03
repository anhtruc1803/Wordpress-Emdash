import type { ProjectRecord } from "@/lib/types/ui";

import { readFile } from "node:fs/promises";

import { getProjectManifestPath } from "./storage";

export async function loadProjectPublic(projectId: string): Promise<ProjectRecord> {
  const content = await readFile(getProjectManifestPath(projectId), "utf8");
  return JSON.parse(content) as ProjectRecord;
}
