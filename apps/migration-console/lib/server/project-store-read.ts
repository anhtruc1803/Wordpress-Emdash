import type { ProjectRecord } from "@/lib/types/ui";

import { readFile } from "node:fs/promises";

import { getProjectManifestPath } from "./storage";

export async function loadProjectPublic(projectId: string): Promise<ProjectRecord> {
  const content = await readFile(getProjectManifestPath(projectId), "utf8");
  const project = JSON.parse(content) as ProjectRecord;
  return {
    ...project,
    sourceValidation: project.sourceValidation ?? {
      state: "unknown"
    },
    targetValidation: project.targetValidation ?? {
      state: "unknown"
    }
  };
}
