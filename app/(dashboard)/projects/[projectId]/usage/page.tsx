import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { UsageExplorer } from "@/components/projects/usage-explorer";
import { Section, Skeleton } from "@/components/ui/primitives";
import { getUsage } from "@/lib/data";

export const metadata: Metadata = { title: "Usage — Hecate" };

export default function UsagePage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-[40rem]" />}>
      <ProjectData params={params}>
        {async (p) => (
          <Section title="Usage" description="What your devices have sent, per day. Counted when changes are applied to the database, and refreshed every few minutes.">
            <UsageExplorer data={await getUsage(p.id, 90)} dailyLimit={p.limits.events_per_day} />
          </Section>
        )}
      </ProjectData>
    </Suspense>
  );
}
