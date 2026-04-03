import { NextResponse } from "next/server";

import { getWorkspaceView, testProjectTarget } from "@/lib/server/project-store";

export async function POST(
  _: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const project = await testProjectTarget(projectId);
    const workspace = await getWorkspaceView(projectId);
    return NextResponse.json({ project, workspace });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to test the EmDash connection.";
    return new NextResponse(message, { status: 400 });
  }
}
