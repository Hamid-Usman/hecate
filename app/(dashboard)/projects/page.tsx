import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectList } from "@/components/projects/project-list";
import { PageHeader, Skeleton } from "@/components/ui/primitives";
import { getMe, listProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects — Hecate" };

export default function ProjectsPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <Projects searchParams={searchParams} />
    </Suspense>
  );
}

async function Projects({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const { account: wanted } = await searchParams;
  const me = await getMe();
  const account = me.accounts.find((a) => a.id === wanted) ?? me.accounts[0]!;
  const projects = await listProjects(account.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${account.name} · ${account.role}`}
        title="Projects"
        description="Each project is one app and its synced database, with its own keys, rules and limits."
      />
      {/* key resets the list's local state when another account is chosen */}
      <ProjectList key={account.id} initial={projects} accountId={account.id} role={account.role} />
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
