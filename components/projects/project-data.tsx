import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getProject } from "@/lib/data";
import type { ProjectDetail } from "@/lib/types";

export type ProjectParams = Promise<{ projectId: string }>;

/** Loads the project named in the URL and hands it to `children`. Use inside <Suspense>; unknown ids show the 404 page. */
export async function ProjectData({ params, children }: { params: ProjectParams; children: (project: ProjectDetail) => ReactNode }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();
  return <>{children(project)}</>;
}
