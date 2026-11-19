import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { RulesEditor } from "@/components/projects/rules-editor";
import { Section, Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Rules — Hecate" };

export default function RulesPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ProjectData params={params}>
        {(p) => (
          <Section title="Sync rules" description="Choose which tables sync, and keep each device to the rows it is allowed to see. Changes reach the engine immediately.">
            <RulesEditor key={JSON.stringify(p.rules)} initial={p.rules} readOnly={p.role === "member"} />
          </Section>
        )}
      </ProjectData>
    </Suspense>
  );
}
