import { NextResponse } from "next/server";

import { getWorkspaceView, testProjectSource } from "@/lib/server/project-store";

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const project = await testProjectSource(projectId);
  const workspace = await getWorkspaceView(projectId);
  return NextResponse.json({ project, workspace });
}
