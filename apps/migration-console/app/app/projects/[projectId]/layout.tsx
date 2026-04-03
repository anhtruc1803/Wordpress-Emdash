import { ProjectWorkspaceNav } from "@/components/app-shell/project-workspace-nav";
import { loadProjectPublic } from "@/lib/server/project-store-read";

export default async function ProjectLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await loadProjectPublic(projectId);

  return (
    <div className="space-y-6">
      <ProjectWorkspaceNav projectId={projectId} projectName={project.name} />
      <div>{children}</div>
    </div>
  );
}
