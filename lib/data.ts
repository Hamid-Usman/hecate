/**
 * Reads for the dashboard. MOCK DATA for now: each function matches an endpoint of hecates-backend
 * (named in its comment), so integration means replacing these bodies with fetch calls.
 */
import { PROJECT_ID_PATTERN } from "./format";
import { mockAudit, mockMe, mockProjects, mockUsage } from "./mock";
import type { AuditEntry, Me, Project, ProjectDetail, UsageDay } from "./types";

/** GET /v1/me */
export async function getMe(): Promise<Me> {
  return mockMe;
}

/** GET /v1/accounts/:id/projects */
export async function listProjects(accountId: string): Promise<Project[]> {
  return mockProjects.filter((p) => p.accountId === accountId);
}

/** Every project across the user's accounts (the dashboard's "all projects" view calls the endpoint above once per account). */
export async function listAllProjects(): Promise<Project[]> {
  return mockProjects;
}

/**
 * GET /v1/projects/:id. Resolves to null for "404 not found".
 *
 * Mock only: since nothing is stored yet, any other well-formed id opens as a brand-new development
 * project (so a project you just "created" can be opened). Ids starting with "missing" give the 404.
 */
export async function getProject(id: string): Promise<ProjectDetail | null> {
  const known = mockProjects.find((p) => p.id === id);
  if (known) return known;
  if (!PROJECT_ID_PATTERN.test(id) || id.startsWith("missing")) return null;
  return {
    id,
    accountId: mockMe.accounts[0]!.id,
    name: id.replace(/-3fa9$/, "").replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase()),
    environment: "development",
    status: "active",
    policy: "",
    rules: null,
    limits: {},
    createdAt: "2026-11-19T06:30:00.000Z",
    role: "owner",
    signingKeys: [{ kid: "k1", revoked: false, createdAt: "2026-11-19T06:30:00.000Z" }],
    apiKeys: [],
  };
}

/** GET /v1/projects/:id/usage?days= */
export async function getUsage(id: string, days = 30): Promise<UsageDay[]> {
  return mockUsage(id, days);
}

/** GET /v1/projects/:id/audit */
export async function getAudit(id: string): Promise<AuditEntry[]> {
  return mockAudit(id);
}
