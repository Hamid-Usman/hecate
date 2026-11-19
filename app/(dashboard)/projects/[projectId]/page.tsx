import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UsageChart } from "@/components/charts/usage-chart";
import { AuditList } from "@/components/projects/audit-list";
import { ProjectData, type ProjectParams } from "@/components/projects/project-data";
import { SetupChecklist } from "@/components/projects/setup-checklist";
import { Card, Section, Skeleton, StatTile } from "@/components/ui/primitives";
import { engineUrl } from "@/lib/config";
import { getAudit, getMe, getUsage } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Overview — Hecate" };

export default function OverviewPage({ params }: { params: ProjectParams }) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <ProjectData params={params}>
        {async (project) => {
          const [usage, audit, me] = await Promise.all([getUsage(project.id, 30), getAudit(project.id), getMe()]);
          const today = usage[0];
          const total = usage.reduce((n, d) => n + d.eventsApplied, 0);
          const limit = project.limits.events_per_day;
          const activeKeys = project.apiKeys.filter((k) => !k.revoked).length;

          return (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile
                  label="Changes today"
                  icon="sync"
                  value={formatNumber(today?.eventsApplied ?? 0)}
                  hint={limit ? `${Math.round(((today?.eventsApplied ?? 0) / limit) * 100)}% of the daily limit` : "No daily limit"}
                />
                <StatTile label="Pushes today" icon="usage" value={formatNumber(today?.pushes ?? 0)} hint="Upload requests from devices" />
                <StatTile label="Last 30 days" icon="database" value={formatNumber(total)} hint="Changes applied" />
                <StatTile label="API keys" icon="key" value={activeKeys} hint={activeKeys === 0 ? "None active yet" : `${project.apiKeys.length - activeKeys} revoked`} />
              </div>

              <Section
                title="Traffic"
                description="Changes your devices pushed to the database, per day (UTC)."
                action={
                  <Link href={`/projects/${project.id}/usage`} className="text-sm text-slate underline decoration-ink/20 underline-offset-4 hover:text-ink">
                    Full usage
                  </Link>
                }
              >
                <Card className="p-5 sm:p-6">
                  <UsageChart data={usage} limit={limit} />
                </Card>
              </Section>

              <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
                <SetupChecklist project={project} engine={engineUrl()} />
                <Section
                  title="Recent activity"
                  action={
                    <Link href={`/projects/${project.id}/activity`} className="text-sm text-slate underline decoration-ink/20 underline-offset-4 hover:text-ink">
                      See all
                    </Link>
                  }
                >
                  <Card className="p-6">
                    <AuditList entries={audit} currentUserId={me.user.id} limit={5} />
                  </Card>
                </Section>
              </div>
            </div>
          );
        }}
      </ProjectData>
    </Suspense>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
      <Skeleton className="h-64" />
    </div>
  );
}
