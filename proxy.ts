import { NextResponse, type NextRequest } from "next/server";
import { refresh } from "@/lib/api/auth";
import { REFRESH_WINDOW_MS, SESSION_COOKIE, sessionCookie, tokenExpiry } from "@/lib/session-shared";

/**
 * Optimistic session checks, as recommended by Next.js: send signed-out people to /login, signed-in
 * people away from it, and quietly swap the token for a fresh one before it expires. The backend
 * still verifies every call; this only decides where the browser goes.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expiry = token ? tokenExpiry(token) : null;
  const signedIn = expiry !== null && expiry > Date.now();
  const onAuthPage = pathname === "/login" || pathname === "/register";

  if (!signedIn || searchParams.has("expired")) {
    // No usable session (or the backend rejected it): show the sign-in page and drop any stale cookie.
    const response = onAuthPage ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (onAuthPage) return NextResponse.redirect(new URL("/projects", request.url));

  if (expiry! - Date.now() < REFRESH_WINDOW_MS) {
    try {
      const session = await refresh(token!);
      const response = NextResponse.next();
      response.cookies.set(sessionCookie(session.accessToken, session.expiresIn));
      return response;
    } catch {
      /* the current token still works for now; try again on the next request */
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*", "/settings/:path*", "/login", "/register"],
};
