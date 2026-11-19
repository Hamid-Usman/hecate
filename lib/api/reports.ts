import type { AuditEntry, UsageDay } from "../types";
import { authedHttp } from "./client";

/** GET /v1/projects/:id/usage?days=. Only days with activity are returned, newest first. */
export async function fetchUsage(projectId: string, days: number): Promise<UsageDay[]> {
  return (await (await authedHttp()).get<UsageDay[]>(`/v1/projects/${encodeURIComponent(projectId)}/usage`, { params: { days } })).data;
}

/** GET /v1/projects/:id/audit */
export async function fetchAudit(projectId: string): Promise<AuditEntry[]> {
  return (await (await authedHttp()).get<AuditEntry[]>(`/v1/projects/${encodeURIComponent(projectId)}/audit`)).data;
}
