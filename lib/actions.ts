"use server";

import { redirect } from "next/navigation";
import * as auth from "./api/auth";
import { ApiError, type ActionResult } from "./errors";
import { clearSession, setSession } from "./session";

/**
 * Sign-in, register and sign-out stay Server Actions because they set or clear the httpOnly session
 * cookie. Everything else the dashboard does goes through React Query (lib/queries.ts).
 */

/** Run a backend call and return its outcome instead of throwing (Next hides thrown messages in production). */
async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, status: e.status, message: e.message };
    throw e;
  }
}

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
