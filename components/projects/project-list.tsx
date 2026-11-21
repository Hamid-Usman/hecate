"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icons";
import { EmptyState, EnvBadge, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { policyLabel } from "@/lib/meta";
import type { Project, Role } from "@/lib/types";
import { CreateProjectDialog } from "./create-project-dialog";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
] as const;

/** `projects` comes from the cache; creating a project adds it there. */
export function ProjectList({ projects, accountId, role }: { projects: Project[]; accountId: string; role: Role }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [creating, setCreating] = useState(false);
  const canCreate = role !== "member";

  const shown = useMemo(
    () =>
      projects.filter(
        (p) => (filter === "all" || p.status === filter) && (p.name + p.id).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [projects, query, filter],
  );

  const newButton = (
    <Button icon="plus" onClick={() => setCreating(true)} disabled={!canCreate} title={canCreate ? undefined : "Only owners and admins can create projects"}>
      New project
    </Button>
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate" />
            <Input aria-label="Search projects" placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 !rounded-full pl-10" />
          </div>
          <div role="group" aria-label="Filter by status" className="inline-flex rounded-full border border-ink/12 p-0.5">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${filter === f.value ? "bg-ink text-paper" : "text-slate hover:text-ink"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {newButton}
      </div>

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="database"
            title="No projects yet"
            body="A project is one app whose devices sync through Hecate. Create one to get its keys and start connecting devices."
            action={newButton}
          />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="search"
            title="Nothing matches"
            body="No project fits that search and filter."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {shown.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="group block h-full rounded-3xl border border-ink/10 bg-paper/80 p-5 transition duration-300 ease-out hover:border-ink hover:bg-ink hover:text-paper hover:shadow-2xl hover:shadow-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-2xl tracking-tight">{p.name}</h2>
                    <p className="mt-0.5 truncate font-mono text-[12px] text-slate transition-colors group-hover:text-mist/70">{p.id}</p>
                  </div>
                  <Icon name="chevron" className="mt-1.5 text-slate transition group-hover:translate-x-0.5 group-hover:text-rust" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <EnvBadge environment={p.environment} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-[13px] transition-colors group-hover:border-mist/15">
                  <div>
                    <dt className="font-mono text-[11px] tracking-wide text-slate uppercase transition-colors group-hover:text-mist/60">Conflicts</dt>
                    <dd className="mt-0.5">{policyLabel(p.policy)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] tracking-wide text-slate uppercase transition-colors group-hover:text-mist/60">Created</dt>
                    <dd className="mt-0.5">{formatDate(p.createdAt)}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateProjectDialog
        open={creating}
        onClose={() => setCreating(false)}
        accountId={accountId}
        onCreated={(p) => {
          toast(`Project “${p.name}” created. Next: create an API key.`);
        }}
      />
    </>
  );
}
