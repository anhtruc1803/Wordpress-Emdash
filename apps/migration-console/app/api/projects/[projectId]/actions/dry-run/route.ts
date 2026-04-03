import { NextResponse } from "next/server";

import { loadProjectPublic, runProjectDryRun } from "@/lib/server/project-store-public";

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const workspace = await runProjectDryRun(projectId);
  const project = await loadProjectPublic(projectId);
  return NextResponse.json({ project, workspace });
}
