import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, apiUrl } from "@/lib/session-shared";

/**
 * The browser's door to hecates-backend. React Query calls /api/hecate/v1/…; this handler adds the
 * signed-in person's token from the httpOnly session cookie and forwards the request. The token
 * never reaches JavaScript in the browser, and the backend never has to be reachable from it.
 *
 * Only the dashboard's own endpoints are forwarded (an allowlist), so this can't be used to reach
 * the backend's internal or auth endpoints.
 */
const ALLOWED = [/^v1\/me$/, /^v1\/accounts\/[^/]+\/projects$/, /^v1\/projects\/[^/]+(\/(api-keys|signing-keys)(\/[^/]+)?|\/usage|\/audit)?$/];

const backend = axios.create({ baseURL: apiUrl(), timeout: 30_000, validateStatus: () => true });

async function forward(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  // Each segment arrives decoded; re-encode it so "a/b" can't become two segments.
  if (path.some((s) => s === "." || s === ".." || s === "")) return error(404, "Not found");
  const joined = path.map(encodeURIComponent).join("/");
  if (!ALLOWED.some((re) => re.test(joined))) return error(404, "Not found");

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return error(401, "Your session has ended. Please sign in again.");

  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const body = hasBody ? await request.text() : undefined;

  try {
    const res = await backend.request({
      method: request.method,
      url: `/${joined}`,
      params: Object.fromEntries(request.nextUrl.searchParams),
      data: body || undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      transformResponse: (raw) => raw, // pass the body through untouched
    });
    return new NextResponse(res.status === 204 ? null : (res.data as string), {
      status: res.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return error(503, "The Hecate control plane can’t be reached right now. Please try again in a moment.");
  }
}

function error(status: number, message: string) {
  return NextResponse.json({ statusCode: status, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
