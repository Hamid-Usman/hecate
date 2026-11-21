"use client";

import { useMutation, useQueries, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { browserHttp as http } from "./api/browser";
import { ApiError } from "./errors";
import type { AuditEntry, ConflictPolicy, Environment, Limits, Me, Project, ProjectDetail, Rules, UsageDay } from "./types";

/**
 * Every read and write the dashboard makes, through React Query.
 *
 * Reads are cached and shared: the sidebar, the projects page and every project tab use the same
 * entries, so moving between pages doesn't call the backend again while the data is fresh (see the
 * stale times in components/providers.tsx). Writes update the cache from the backend's response
 * instead of refetching, and only mark the activity log stale, since every change adds an entry.
 */

/** Result of telling the engine instances to drop their cached copy of a project. */
export interface EngineRefresh {
  refreshed: number;
  failed: number;
}

export interface ProjectPatch {
  name?: string;
  status?: "active" | "suspended";
  policy?: ConflictPolicy;
  rules?: Rules | null;
  limits?: Limits;
}

/** The longest usage range the dashboard shows. One fetch serves the 7, 30 and 90 day views. */
export const USAGE_DAYS = 90;

export const queryKeys = {
  me: ["me"] as const,
  projects: (accountId: string) => ["projects", accountId] as const,
  project: (id: string) => ["project", id] as const,
  usage: (id: string) => ["project", id, "usage"] as const,
  audit: (id: string) => ["project", id, "audit"] as const,
};

const enc = encodeURIComponent;
const projectPath = (id: string) => `/v1/projects/${enc(id)}`;

// ------------------------------------------------------------------------- reads

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: async () => (await http.get<Me>("/v1/me")).data });
}

const projectsQuery = (accountId: string) => ({
  queryKey: queryKeys.projects(accountId),
  queryFn: async () => (await http.get<Project[]>(`/v1/accounts/${enc(accountId)}/projects`)).data,
});

export function useProjects(accountId: string | undefined) {
  return useQuery({ ...projectsQuery(accountId ?? ""), enabled: Boolean(accountId) });
}

/** The projects of every account the user belongs to, for the sidebar. Shares the per-account cache. */
export function useAllProjects() {
  const me = useMe();
  return useQueries({
    queries: (me.data?.accounts ?? []).map((a) => projectsQuery(a.id)),
    combine: (results) => ({
      data: results.flatMap((r) => r.data ?? []),
      isPending: me.isPending || results.some((r) => r.isPending),
    }),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: async () => (await http.get<ProjectDetail>(projectPath(id))).data,
  });
}

/**
 * Usage for the last USAGE_DAYS days, newest first. The backend lists only days with activity;
 * the gaps are filled with zeros so charts show real time.
 */
export function useUsage(id: string) {
  return useQuery({
    queryKey: queryKeys.usage(id),
    queryFn: async () => (await http.get<UsageDay[]>(`${projectPath(id)}/usage`, { params: { days: USAGE_DAYS } })).data,
    select: fillDays,
    staleTime: 5 * 60_000, // the backend collects usage from the engine every few minutes
  });
}

function fillDays(rows: UsageDay[]): UsageDay[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const now = new Date();
  return Array.from({ length: USAGE_DAYS }, (_, i) => {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)).toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, eventsApplied: 0, pushes: 0 };
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: queryKeys.audit(id),
    queryFn: async () => (await http.get<AuditEntry[]>(`${projectPath(id)}/audit`)).data,
  });
}

// ------------------------------------------------------------------------ writes

/** Apply `fn` to a cached project detail, if it is cached. */
function updateDetail(qc: QueryClient, id: string, fn: (p: ProjectDetail) => ProjectDetail) {
  qc.setQueryData<ProjectDetail>(queryKeys.project(id), (p) => (p ? fn(p) : p));
}

/** Apply `fn` to the project lists of every account that are cached. */
function updateLists(qc: QueryClient, fn: (list: Project[]) => Project[]) {
  qc.setQueriesData<Project[]>({ queryKey: ["projects"] }, (list) => (list ? fn(list) : list));
}

/** Every change is recorded in the audit log, so the cached log is out of date afterwards. */
const auditChanged = (qc: QueryClient, id: string) => qc.invalidateQueries({ queryKey: queryKeys.audit(id), exact: true });

export function useCreateProject(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string; environment: Environment }) =>
      (await http.post<Project>(`/v1/accounts/${enc(accountId)}/projects`, input)).data,
    onSuccess: (project) => {
      qc.setQueryData<Project[]>(queryKeys.projects(accountId), (list) => [project, ...(list ?? [])]);
    },
  });
}

export function usePatchProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProjectPatch) => (await http.patch<Project & { engine: EngineRefresh }>(projectPath(id), patch)).data,
    // `engine` reports the cache refresh on the engine; it isn't part of the project.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: ({ engine, ...project }) => {
      updateDetail(qc, id, (p) => ({ ...p, ...project }));
      updateLists(qc, (list) => list.map((p) => (p.id === id ? { ...p, ...project } : p)));
      void auditChanged(qc, id);
    },
  });
}

export function useDeleteProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await http.delete<{ deleted: string }>(projectPath(id))).data,
    onSuccess: () => {
      updateLists(qc, (list) => list.filter((p) => p.id !== id));
      qc.removeQueries({ queryKey: queryKeys.project(id) }); // the detail, usage and audit together
    },
  });
}

/** The full key is in the result, and only there. */
export function useCreateApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (label: string) =>
      (await http.post<{ id: string; label: string; key: string; engine: EngineRefresh }>(`${projectPath(projectId)}/api-keys`, { label })).data,
    onSuccess: (k) => {
      updateDetail(qc, projectId, (p) => ({ ...p, apiKeys: [{ id: k.id, label: k.label, revoked: false, createdAt: new Date().toISOString() }, ...p.apiKeys] }));
      void auditChanged(qc, projectId);
    },
  });
}

export function useRevokeApiKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: string) => (await http.delete(`${projectPath(projectId)}/api-keys/${enc(keyId)}`)).data,
    onSuccess: (_data, keyId) => {
      updateDetail(qc, projectId, (p) => ({ ...p, apiKeys: p.apiKeys.map((k) => (k.id === keyId ? { ...k, revoked: true } : k)) }));
      void auditChanged(qc, projectId);
    },
  });
}

export function useRotateSigningKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await http.post<{ kid: string; engine: EngineRefresh }>(`${projectPath(projectId)}/signing-keys`)).data,
    onSuccess: ({ kid }) => {
      updateDetail(qc, projectId, (p) => ({ ...p, signingKeys: [{ kid, revoked: false, createdAt: new Date().toISOString() }, ...p.signingKeys] }));
      void auditChanged(qc, projectId);
    },
  });
}

export function useRevokeSigningKey(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kid: string) => (await http.delete(`${projectPath(projectId)}/signing-keys/${enc(kid)}`)).data,
    onSuccess: (_data, kid) => {
      updateDetail(qc, projectId, (p) => ({ ...p, signingKeys: p.signingKeys.map((k) => (k.kid === kid ? { ...k, revoked: true } : k)) }));
      void auditChanged(qc, projectId);
    },
  });
}

/** True for "this project doesn't exist or isn't yours" (the backend answers 404, or 400 for a malformed id). */
export const isNotFound = (error: unknown) => error instanceof ApiError && (error.status === 404 || error.status === 400);
