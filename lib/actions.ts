/**
 * Writes for the dashboard. MOCK for now: each one waits a moment and returns what the backend
 * endpoint in its comment returns. Replace the bodies when integrating. Errors are thrown as
 * ApiError, matching the backend's { statusCode, error, message } body.
 */
import type { ApiKey, ConflictPolicy, Environment, Limits, Project, Rules } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));

/** Engine refresh result that mutating endpoints return. */
export interface EngineRefresh {
  refreshed: number;
  failed: number;
}
const refreshed: EngineRefresh = { refreshed: 1, failed: 0 };

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** POST /v1/auth/login */
export async function login(email: string, password: string): Promise<void> {
  await wait();
  if (password === "wrong-password") throw new ApiError(401, "wrong email or password");
  void email;
}

/** POST /v1/auth/register */
export async function register(input: { email: string; password: string; name?: string }): Promise<void> {
  await wait(600);
  if (input.email === "taken@example.com") throw new ApiError(409, "that email is already registered");
}

/** POST /v1/accounts/:id/projects */
export async function createProject(accountId: string, input: { id?: string; name: string; environment: Environment }): Promise<Project> {
  await wait(600);
  const id = input.id || `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "project"}-3fa9`;
  if (id === "shop-app") throw new ApiError(409, `the project id "${id}" is already taken`);
  return {
    id,
    accountId,
    name: input.name,
    environment: input.environment,
    status: "active",
    policy: "",
    rules: null,
    limits: {},
    createdAt: "2026-11-19T06:30:00.000Z",
  };
}

/** PATCH /v1/projects/:id */
export async function patchProject(
  _id: string,
  patch: { name?: string; status?: "active" | "suspended"; policy?: ConflictPolicy; rules?: Rules | null; limits?: Limits },
): Promise<{ patch: typeof patch; engine: EngineRefresh }> {
  await wait();
  return { patch, engine: refreshed };
}

/** DELETE /v1/projects/:id */
export async function deleteProject(id: string): Promise<{ deleted: string }> {
  await wait(900);
  return { deleted: id };
}

/** POST /v1/projects/:id/api-keys. The full key is returned once. */
export async function createApiKey(projectId: string, label: string): Promise<{ id: string; label: string; key: string; engine: EngineRefresh }> {
  await wait(600);
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  const key = `hsk.${b64url(new TextEncoder().encode(projectId))}.${b64url(secret)}`;
  return { id: [...secret.slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join(""), label, key, engine: refreshed };
}

/** DELETE /v1/projects/:id/api-keys/:keyId */
export async function revokeApiKey(keyId: string): Promise<{ revoked: string; engine: EngineRefresh }> {
  await wait();
  return { revoked: keyId, engine: refreshed };
}

/** POST /v1/projects/:id/signing-keys */
export async function rotateSigningKey(nextKid: string): Promise<{ kid: string; engine: EngineRefresh }> {
  await wait(700);
  return { kid: nextKid, engine: refreshed };
}

/** DELETE /v1/projects/:id/signing-keys/:kid */
export async function revokeSigningKey(kid: string): Promise<{ revoked: string; engine: EngineRefresh }> {
  await wait();
  return { revoked: kid, engine: refreshed };
}

export type { ApiKey };
