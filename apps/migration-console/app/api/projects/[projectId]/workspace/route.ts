import { NextResponse } from "next/server";

import { getWorkspaceView } from "@/lib/server/project-store";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const workspace = await getWorkspaceView(projectId);
  return NextResponse.json({ workspace });
}
