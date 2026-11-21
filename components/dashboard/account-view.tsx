"use client";

import { LoadError } from "@/components/projects/project-gate";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card, PageHeader, Section, Skeleton } from "@/components/ui/primitives";
import { useMe } from "@/lib/queries";
import { useSignOut } from "./shell";

export function AccountView() {
  const me = useMe();
  const signOut = useSignOut();

  if (me.isPending) return <Skeleton className="h-[32rem]" />;
  if (me.error) return <LoadError message={me.error.message} onRetry={() => void me.refetch()} busy={me.isRefetching} />;
  const { user, accounts } = me.data;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Account" title="Your account" description="Who you are, and which accounts you can work in." />

      <Section title="Profile">
        <Card className="divide-y divide-ink/8">
          <Row label="Name" value={user.name ?? "Not set"} />
          <Row label="Email" value={user.email} />
          <Row label="User id" value={<code className="font-mono text-[12.5px]">{user.id}</code>} />
        </Card>
      </Section>

      <Section title="Accounts" description="Your personal account, and any team account you were added to. Owners and admins manage projects; members can look but not change.">
        <Card className="divide-y divide-ink/8">
          {accounts.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="mt-0.5 text-[13px] text-slate capitalize">{a.plan} plan</p>
              </div>
              <Badge tone={a.role === "owner" ? "rust" : "neutral"}>{a.role}</Badge>
              <ButtonLink href={`/projects?account=${a.id}`} variant="secondary" size="sm">
                View projects
              </ButtonLink>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Session">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="max-w-md text-sm text-slate">Signing out ends this session on this device. Your projects and keys are not affected.</p>
          <form action={signOut}>
            <Button type="submit" variant="secondary" icon="logout">
              Sign out
            </Button>
          </form>
        </Card>
      </Section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm">
      <span className="text-slate">{label}</span>
      <span className="min-w-0 break-all">{value}</span>
    </div>
  );
}
