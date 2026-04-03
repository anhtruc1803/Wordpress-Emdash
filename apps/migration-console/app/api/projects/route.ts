import { NextResponse } from "next/server";

import type { ProjectCreateInput } from "@/lib/types/ui";

import { createProjectFromInput, listProjects } from "@/lib/server/project-store";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "");
    const sourceKind = String(formData.get("sourceKind") ?? "wxr") as ProjectCreateInput["sourceKind"];
    const sourceUrl = String(formData.get("sourceUrl") ?? "");
    const file = formData.get("file");

    const uploaded =
      file instanceof File
        ? {
            name: file.name,
            buffer: Buffer.from(await file.arrayBuffer())
          }
        : undefined;

    const project = await createProjectFromInput(
      {
        name,
        sourceKind,
        sourceUrl
      },
      uploaded
    );

    return NextResponse.json({ project });
  }

  const payload = (await request.json()) as ProjectCreateInput;
  const project = await createProjectFromInput(payload);
  return NextResponse.json({ project });
}
