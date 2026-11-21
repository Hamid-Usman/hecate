import type { Metadata } from "next";
import { Suspense } from "react";
import { EngineStatus } from "@/components/projects/engine-status";
import { ConnectGuideView } from "@/components/projects/project-views";
import { Section, Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Connect — Hecate" };

export default function ConnectPage() {
  return (
    <Section title="Connect your app" description="Everything a developer needs to sync a local database with this project, filled in with your project’s own values.">
      <div className="space-y-8">
        <Suspense fallback={<Skeleton className="h-28" />}>
          <EngineStatus />
        </Suspense>
        <ConnectGuideView />
      </div>
    </Section>
  );
}
