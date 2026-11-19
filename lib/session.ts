import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookie } from "./session-shared";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Only callable from a Server Action or Route Handler. */
export async function setSession(token: string, expiresIn: number) {
  (await cookies()).set(sessionCookie(token, expiresIn));
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
