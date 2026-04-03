import { NextResponse } from "next/server";

import type { ManualFixUpdateInput } from "@/lib/types/ui";

import { loadProjectPublic, updateManualFix } from "@/lib/server/project-store-public";

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string; fixId: string }> }) {
  const { projectId, fixId } = await context.params;
  const payload = (await request.json()) as ManualFixUpdateInput;
  const workspace = await updateManualFix(projectId, fixId, payload);
  const project = await loadProjectPublic(projectId);
  return NextResponse.json({ project, workspace });
}
