"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/primitives";
import { isNotFound, useProject } from "@/lib/queries";
import type { ProjectDetail } from "@/lib/types";
import { ProjectNotFoundState } from "./not-found-state";

/** The project id from the URL. Only for components under /projects/[projectId]. */
export function useProjectId(): string {
  return useParams<{ projectId: string }>().projectId;
}

/**
 * Loads the project named in the URL (from the cache when it's there) and hands it to `children`.
 * Every tab uses it, and they share one cached copy, so switching tabs doesn't refetch it.
 * `quiet` renders nothing for errors, for places where another gate on the page already reports them.
 */
export function ProjectGate({ fallback, quiet, children }: { fallback: ReactNode; quiet?: boolean; children: (project: ProjectDetail) => ReactNode }) {
  const { data, error, isPending, refetch, isRefetching } = useProject(useProjectId());

  if (isPending) return <>{fallback}</>;
  if (error) {
    if (quiet) return null;
    if (isNotFound(error)) return <ProjectNotFoundState />;
    return <LoadError message={error.message} onRetry={() => void refetch()} busy={isRefetching} />;
  }
  return <>{children(data)}</>;
}

export function LoadError({ message, onRetry, busy }: { message: string; onRetry: () => void; busy?: boolean }) {
  return (
    <div className="space-y-3">
      <Callout tone="danger" title="This couldn’t be loaded">
        {message || "Something went wrong. Please try again."}
      </Callout>
      <Button variant="secondary" icon="refresh" onClick={onRetry} loading={busy}>
        Try again
      </Button>
    </div>
  );
}
