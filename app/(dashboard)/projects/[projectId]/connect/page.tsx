import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectGuide } from "@/components/projects/connect-guide";
import { EngineStatus } from "@/components/projects/engine-status";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { Section, Skeleton } from "@/components/ui/primitives";
import { engineUrl } from "@/lib/config";

export const metadata: Metadata = { title: "Connect — Hecate" };

export default function ConnectPage({ params }: { params: ProjectParams }) {
  return (
    <Section title="Connect your app" description="Everything a developer needs to sync a local database with this project, filled in with your project’s own values.">
      <div className="space-y-8">
        <Suspense fallback={<Skeleton className="h-28" />}>
          <EngineStatus />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[40rem]" />}>
          <ProjectData params={params}>{(p) => <ConnectGuide project={p} engine={engineUrl()} />}</ProjectData>
        </Suspense>
      </div>
    </Section>
  );
}
