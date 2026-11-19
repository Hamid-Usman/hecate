import "server-only";
import { connection } from "next/server";
import { fetchProject, fetchProjects, fetchMe } from "./api/projects";
import { fetchAudit, fetchUsage } from "./api/reports";
import { ApiError } from "./errors";
import type { AuditEntry, Me, Project, ProjectDetail, UsageDay } from "./types";

/** The signed-in user and their accounts. */
export async function getMe(): Promise<Me> {
  return fetchMe();
}

export async function listProjects(accountId: string): Promise<Project[]> {
  return fetchProjects(accountId);
}

/** The projects of every account the user belongs to, for the sidebar. */
export async function listAllProjects(): Promise<Project[]> {
  const me = await fetchMe();
  return (await Promise.all(me.accounts.map((a) => fetchProjects(a.id)))).flat();
}

/** Null when the backend answers 404 (missing, or in someone else's account) or the id is malformed. */
export async function getProject(id: string): Promise<ProjectDetail | null> {
  try {
    return await fetchProject(id);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

/**
 * The backend lists only days that had activity; this fills the gaps with zeros so charts show
 * real time, newest day first.
 */
export async function getUsage(id: string, days = 30): Promise<UsageDay[]> {
  const rows = await fetchUsage(id, days);
  await connection(); // "today" is request time
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)).toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, eventsApplied: 0, pushes: 0 };
  });
}

export async function getAudit(id: string): Promise<AuditEntry[]> {
  return fetchAudit(id);
}
