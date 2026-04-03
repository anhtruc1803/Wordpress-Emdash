import { NextResponse } from "next/server";

import type { ProjectUpdateInput } from "@/lib/types/ui";

import { loadProjectPublic, updateProject } from "@/lib/server/project-store-public";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const project = await loadProjectPublic(projectId);
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const patch = (await request.json()) as ProjectUpdateInput;
  const project = await updateProject(projectId, patch);
  return NextResponse.json({ project });
}
