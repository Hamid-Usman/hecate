"use client";

import Link from "next/link";
import { UsageChart } from "@/components/charts/usage-chart";
import { useEngineUrl } from "@/components/providers";
import { CodeBlock } from "@/components/ui/copy";
import { Card, Section, Skeleton, StatTile } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/format";
import { useAudit, useMe, useUsage } from "@/lib/queries";
import { ApiKeysPanel } from "./api-keys-panel";
import { AuditList } from "./audit-list";
import { ConnectGuide } from "./connect-guide";
import { LoadError, ProjectGate, useProjectId } from "./project-gate";
import { RulesEditor } from "./rules-editor";
import { SettingsPanel } from "./settings-panel";
import { SetupChecklist } from "./setup-checklist";
import { SigningKeysPanel } from "./signing-keys-panel";
import { UsageExplorer } from "./usage-explorer";

// ------------------------------------------------------------------------ overview

export function OverviewView() {
  const engine = useEngineUrl();
  return (
    <ProjectGate fallback={<OverviewSkeleton />}>
      {(project) => {
        const limit = project.limits.events_per_day;
        const activeKeys = project.apiKeys.filter((k) => !k.revoked).length;
        return (
          <div className="space-y-10">
            <OverviewUsage limit={limit} activeKeys={activeKeys} revokedKeys={project.apiKeys.length - activeKeys} />
            <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
              <SetupChecklist project={project} engine={engine} />
              <Section
                title="Recent activity"
                action={
                  <Link href={`/projects/${project.id}/activity`} className="text-sm text-slate underline decoration-ink/20 underline-offset-4 hover:text-ink">
                    See all
                  </Link>
                }
              >
                <Card className="p-6">
                  <AuditFeed limit={5} />
                </Card>
              </Section>
            </div>
          </div>
        );
      }}
    </ProjectGate>
  );
}

function OverviewUsage({ limit, activeKeys, revokedKeys }: { limit?: number; activeKeys: number; revokedKeys: number }) {
  const id = useProjectId();
  const usage = useUsage(id);
  if (usage.isPending) return <><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-72" /></>;
  if (usage.error) return <LoadError message={usage.error.message} onRetry={() => void usage.refetch()} busy={usage.isRefetching} />;

  const last30 = usage.data.slice(0, 30);
  const today = last30[0];
  const total = last30.reduce((n, d) => n + d.eventsApplied, 0);
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Changes today"
          icon="sync"
          value={formatNumber(today?.eventsApplied ?? 0)}
          hint={limit ? `${Math.round(((today?.eventsApplied ?? 0) / limit) * 100)}% of the daily limit` : "No daily limit"}
        />
        <StatTile label="Pushes today" icon="usage" value={formatNumber(today?.pushes ?? 0)} hint="Upload requests from devices" />
        <StatTile label="Last 30 days" icon="database" value={formatNumber(total)} hint="Changes applied" />
        <StatTile label="API keys" icon="key" value={activeKeys} hint={activeKeys === 0 ? "None active yet" : `${revokedKeys} revoked`} />
      </div>
      <Section
        title="Traffic"
        description="Changes your devices pushed to the database, per day (UTC)."
        action={
          <Link href={`/projects/${id}/usage`} className="text-sm text-slate underline decoration-ink/20 underline-offset-4 hover:text-ink">
            Full usage
          </Link>
        }
      >
        <Card className="p-5 sm:p-6">
          <UsageChart data={last30} limit={limit} />
        </Card>
      </Section>
    </>
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

// ------------------------------------------------------------------- activity

/** The audit log, with "You" for the signed-in person. */
function AuditFeed({ limit }: { limit?: number }) {
  const audit = useAudit(useProjectId());
  const me = useMe();
  if (audit.isPending || me.isPending) return <Skeleton className="h-40" />;
  if (audit.error) return <LoadError message={audit.error.message} onRetry={() => void audit.refetch()} busy={audit.isRefetching} />;
  return <AuditList entries={audit.data} currentUserId={me.data?.user.id ?? ""} limit={limit} />;
}

export function ActivityView() {
  return (
    <ProjectGate fallback={<Skeleton className="h-96" />}>
      {() => (
        <Section title="Activity" description="Who changed what in this project, newest first. Keys and secrets are never recorded.">
          <Card className="p-6 sm:p-8">
            <AuditFeed />
          </Card>
        </Section>
      )}
    </ProjectGate>
  );
}

// ---------------------------------------------------------------------- usage

export function UsageView() {
  return (
    <ProjectGate fallback={<Skeleton className="h-[40rem]" />}>
      {(p) => (
        <Section title="Usage" description="What your devices have sent, per day. Counted when changes are applied to the database, and refreshed every few minutes.">
          <UsageBody dailyLimit={p.limits.events_per_day} />
        </Section>
      )}
    </ProjectGate>
  );
}

/** Rendered only once the project is known to exist, so a bad id doesn't also fetch usage. */
function UsageBody({ dailyLimit }: { dailyLimit?: number }) {
  const usage = useUsage(useProjectId());
  if (usage.isPending) return <Skeleton className="h-[36rem]" />;
  if (usage.error) return <LoadError message={usage.error.message} onRetry={() => void usage.refetch()} busy={usage.isRefetching} />;
  return <UsageExplorer data={usage.data} dailyLimit={dailyLimit} />;
}

// ------------------------------------------------------------------ keys, rules

export function ApiKeysView() {
  const engine = useEngineUrl();
  return (
    <ProjectGate fallback={<Skeleton className="h-96" />}>
      {(p) => (
        <div className="space-y-10">
          <Section title="API keys" description="Server-side credentials. Your backend trades one for a short-lived token for each device.">
            <ApiKeysPanel projectId={p.id} keys={p.apiKeys} readOnly={p.role === "member"} />
          </Section>
          <Section title="Using a key" description="Call this from your server when a user signs in to your app, then pass the token to the device.">
            <CodeBlock
              title="POST /v1/tokens"
              code={`curl -X POST ${engine}/v1/tokens \\
  -H "Authorization: Bearer hsk.…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "device-123",
    "user_id": "user-42",
    "tenant_id": "store-7",
    "ttl_seconds": 3600
  }'

# → { "token": "hct1.…", "expires_at": "…" }`}
            />
          </Section>
        </div>
      )}
    </ProjectGate>
  );
}

export function SigningKeysView() {
  return (
    <ProjectGate fallback={<Skeleton className="h-96" />}>
      {(p) => (
        <Section title="Signing keys" description="The secrets Hecate uses to sign and check device tokens. You never see them; you only rotate and revoke.">
          <SigningKeysPanel projectId={p.id} keys={p.signingKeys} readOnly={p.role === "member"} />
        </Section>
      )}
    </ProjectGate>
  );
}

export function RulesView() {
  return (
    <ProjectGate fallback={<Skeleton className="h-96" />}>
      {(p) => (
        <Section title="Sync rules" description="Choose which tables sync, and keep each device to the rows it is allowed to see. Changes reach the engine immediately.">
          <RulesEditor key={JSON.stringify(p.rules)} projectId={p.id} initial={p.rules} readOnly={p.role === "member"} />
        </Section>
      )}
    </ProjectGate>
  );
}

export function SettingsView() {
  return <ProjectGate fallback={<Skeleton className="h-[40rem]" />}>{(p) => <SettingsPanel project={p} />}</ProjectGate>;
}

export function ConnectGuideView() {
  const engine = useEngineUrl();
  return <ProjectGate fallback={<Skeleton className="h-[40rem]" />}>{(p) => <ConnectGuide project={p} engine={engine} />}</ProjectGate>;
}
