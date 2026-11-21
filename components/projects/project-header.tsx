"use client";

import Link from "next/link";
import { CopyButton } from "@/components/ui/copy";
import { Icon } from "@/components/ui/icons";
import { Callout, EnvBadge, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { ProjectGate } from "./project-gate";

/** Name, badges and id at the top of every project tab. Errors are shown by the tab below it. */
export function ProjectHeader() {
  return (
    <ProjectGate fallback={<HeaderSkeleton />} quiet>
      {(p) => (
        <div className="space-y-5">
          <div>
            <Link href="/projects" className="inline-flex items-center gap-1.5 text-[13px] text-slate transition hover:text-ink">
              <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
              All projects
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="font-serif text-4xl tracking-tight sm:text-[2.6rem]">{p.name}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <EnvBadge environment={p.environment} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate">
              <span>Project id</span>
              <code className="rounded-md bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-ink">{p.id}</code>
              <CopyButton value={p.id} label="Copy id" />
            </div>
          </div>

          {p.status === "suspended" ? (
            <Callout tone="warn" title="This project is suspended">
              The engine refuses all syncing for it, so devices keep working offline and queue their changes. Resume it in Settings.
            </Callout>
          ) : null}
          {p.role === "member" ? (
            <Callout title="You have read-only access">
              You’re a member of this account. Owners and admins can change settings and keys.
            </Callout>
          ) : null}
        </div>
      )}
    </ProjectGate>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-80" />
      <Skeleton className="h-5 w-64" />
    </div>
  );
}
