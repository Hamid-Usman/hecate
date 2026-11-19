"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as auth from "./api/auth";
import * as keys from "./api/keys";
import * as projects from "./api/projects";
import { ApiError, type ActionResult } from "./errors";
import { clearSession, setSession } from "./session";
import type { Environment, Project } from "./types";

export type { EngineRefresh, ProjectPatch } from "./api/projects";

/** Run a backend call and return its outcome. Redirects (a 401 sends you to sign in) still propagate. */
async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, status: e.status, message: e.message };
    throw e;
  }
}

/** Refresh every page that shows project data (sidebar, lists, detail). */
const refreshAll = () => revalidatePath("/", "layout");

// ---------------------------------------------------------------- authentication

export async function login(email: string, password: string): Promise<ActionResult<null>> {
  return run(async () => {
    const s = await auth.login(email, password);
    await setSession(s.accessToken, s.expiresIn);
    return null;
  });
}

/** Registering also signs the person in. */
export async function register(input: { email: string; password: string; name?: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const s = await auth.register(input);
    await setSession(s.accessToken, s.expiresIn);
    return null;
  });
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}

// -------------------------------------------------------------------- projects

export async function createProject(accountId: string, input: { id?: string; name: string; environment: Environment }): Promise<ActionResult<Project>> {
  return run(async () => {
    const project = await projects.postProject(accountId, input);
    refreshAll();
    return project;
  });
}

export async function patchProject(id: string, patch: projects.ProjectPatch): Promise<ActionResult<{ engine: projects.EngineRefresh }>> {
  return run(async () => {
    const { engine } = await projects.patchProjectById(id, patch);
    refreshAll();
    return { engine };
  });
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  return run(async () => {
    await projects.removeProject(id);
    refreshAll();
    return null;
  });
}

// ------------------------------------------------------------------- API keys

/** The full key is returned once. */
export async function createApiKey(projectId: string, label: string): Promise<ActionResult<{ id: string; label: string; key: string }>> {
  return run(async () => {
    const { id, label: saved, key } = await keys.postApiKey(projectId, label);
    refreshAll();
    return { id, label: saved, key };
  });
}

export async function revokeApiKey(projectId: string, keyId: string): Promise<ActionResult<null>> {
  return run(async () => {
    await keys.removeApiKey(projectId, keyId);
    refreshAll();
    return null;
  });
}

// --------------------------------------------------------------- signing keys

export async function rotateSigningKey(projectId: string): Promise<ActionResult<{ kid: string }>> {
  return run(async () => {
    const { kid } = await keys.postSigningKey(projectId);
    refreshAll();
    return { kid };
  });
}

export async function revokeSigningKey(projectId: string, kid: string): Promise<ActionResult<null>> {
  return run(async () => {
    await keys.removeSigningKey(projectId, kid);
    refreshAll();
    return null;
  });
}
