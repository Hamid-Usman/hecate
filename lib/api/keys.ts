import { authedHttp } from "./client";
import type { EngineRefresh } from "./projects";

const base = (projectId: string) => `/v1/projects/${encodeURIComponent(projectId)}`;

// ---------------------------------------------------------------------- API keys

/** POST /v1/projects/:id/api-keys. `key` is the full secret and is returned only here. */
export async function postApiKey(projectId: string, label: string): Promise<{ id: string; label: string; key: string; engine: EngineRefresh }> {
  return (await (await authedHttp()).post(`${base(projectId)}/api-keys`, { label })).data;
}

/** DELETE /v1/projects/:id/api-keys/:keyId */
export async function removeApiKey(projectId: string, keyId: string): Promise<{ revoked: string; engine: EngineRefresh }> {
  return (await (await authedHttp()).delete(`${base(projectId)}/api-keys/${encodeURIComponent(keyId)}`)).data;
}

// ------------------------------------------------------------------ signing keys

/** POST /v1/projects/:id/signing-keys */
export async function postSigningKey(projectId: string): Promise<{ kid: string; engine: EngineRefresh }> {
  return (await (await authedHttp()).post(`${base(projectId)}/signing-keys`)).data;
}

/** DELETE /v1/projects/:id/signing-keys/:kid */
export async function removeSigningKey(projectId: string, kid: string): Promise<{ revoked: string; engine: EngineRefresh }> {
  return (await (await authedHttp()).delete(`${base(projectId)}/signing-keys/${encodeURIComponent(kid)}`)).data;
}
