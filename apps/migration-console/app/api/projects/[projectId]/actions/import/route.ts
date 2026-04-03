import { NextResponse } from "next/server";

import { loadProjectPublic, runProjectImport } from "@/lib/server/project-store-public";

export async function POST(
  _: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const workspace = await runProjectImport(projectId);
    const project = await loadProjectPublic(projectId);
    return NextResponse.json({ project, workspace });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to run live EmDash import.";
    return new NextResponse(message, { status: 400 });
  }
}
