/** Session cookie settings shared by the proxy and the server code. No server-only imports here. */
export const SESSION_COOKIE = "hecate_session";

/** The token expires this many seconds before the backend would reject it, so we never send a dead one. */
export const REFRESH_WINDOW_MS = 10 * 60 * 1000;

export function sessionCookie(token: string, expiresInSeconds: number) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresInSeconds,
  };
}

/** Expiry (ms since epoch) from the JWT payload. Only for deciding when to refresh: the backend does the real check. */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const apiUrl = () => (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
