import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditList } from "@/components/projects/audit-list";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { Card, Section, Skeleton } from "@/components/ui/primitives";
import { getAudit, getMe } from "@/lib/data";

export const metadata: Metadata = { title: "Activity — Hecate" };

export default function ActivityPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ProjectData params={params}>
        {async (p) => {
          const [entries, me] = await Promise.all([getAudit(p.id), getMe()]);
          return (
            <Section title="Activity" description="Who changed what in this project, newest first. Keys and secrets are never recorded.">
              <Card className="p-6 sm:p-8">
                <AuditList entries={entries} currentUserId={me.user.id} />
              </Card>
            </Section>
          );
        }}
      </ProjectData>
    </Suspense>
  );
}
