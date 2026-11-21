"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader, Skeleton } from "@/components/ui/primitives";
import { useMe, useProjects } from "@/lib/queries";
import { LoadError } from "./project-gate";
import { ProjectList } from "./project-list";

/** Projects of the account in ?account= (the first account when it's missing or unknown). */
export function ProjectsView() {
  const wanted = useSearchParams().get("account");
  const me = useMe();
  const account = me.data?.accounts.find((a) => a.id === wanted) ?? me.data?.accounts[0];
  const projects = useProjects(account?.id);

  if (me.error) return <LoadError message={me.error.message} onRetry={() => void me.refetch()} busy={me.isRefetching} />;
  if (!account || projects.isPending) return <ProjectsSkeleton />;
  if (projects.error) return <LoadError message={projects.error.message} onRetry={() => void projects.refetch()} busy={projects.isRefetching} />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${account.name} · ${account.role}`}
        title="Projects"
        description="Each project is one app and its synced database, with its own keys, rules and limits."
      />
      {/* key resets the search and filter when another account is chosen */}
      <ProjectList key={account.id} projects={projects.data} accountId={account.id} role={account.role} />
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-24 max-w-md" />
      <Skeleton className="h-10" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
