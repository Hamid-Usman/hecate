import type { ConflictPolicy, Environment, Limits, Me, Project, ProjectDetail, Rules } from "../types";
import { authedHttp } from "./client";

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

/** GET /v1/me */
export async function fetchMe(): Promise<Me> {
  return (await (await authedHttp()).get<Me>("/v1/me")).data;
}

/** GET /v1/accounts/:accountId/projects */
export async function fetchProjects(accountId: string): Promise<Project[]> {
  return (await (await authedHttp()).get<Project[]>(`/v1/accounts/${accountId}/projects`)).data;
}

/** POST /v1/accounts/:accountId/projects */
export async function postProject(accountId: string, input: { id?: string; name: string; environment: Environment }): Promise<Project> {
  return (await (await authedHttp()).post<Project>(`/v1/accounts/${accountId}/projects`, input)).data;
}

/** GET /v1/projects/:id */
export async function fetchProject(id: string): Promise<ProjectDetail> {
  return (await (await authedHttp()).get<ProjectDetail>(`/v1/projects/${encodeURIComponent(id)}`)).data;
}

/** PATCH /v1/projects/:id */
export async function patchProjectById(id: string, patch: ProjectPatch): Promise<Project & { engine: EngineRefresh }> {
  return (await (await authedHttp()).patch<Project & { engine: EngineRefresh }>(`/v1/projects/${encodeURIComponent(id)}`, patch)).data;
}

/** DELETE /v1/projects/:id. The backend erases the engine's data first. */
export async function removeProject(id: string): Promise<{ deleted: string }> {
  return (await (await authedHttp()).delete<{ deleted: string }>(`/v1/projects/${encodeURIComponent(id)}`)).data;
}
