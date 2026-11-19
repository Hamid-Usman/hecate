import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { SettingsPanel } from "@/components/projects/settings-panel";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Settings — Hecate" };

export default function SettingsPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <ProjectData params={params}>{(p) => <SettingsPanel project={p} />}</ProjectData>
    </Suspense>
  );
}
