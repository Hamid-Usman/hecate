import "server-only";
import type { AxiosInstance } from "axios";
import { redirect } from "next/navigation";
import { ApiError } from "../errors";
import { getToken } from "../session";
import { createHttp } from "./http";

/**
 * An axios instance carrying the signed-in person's token. No session sends them to sign in, and so
 * does a 401 from the backend (an expired or revoked token).
 */
export async function authedHttp(): Promise<AxiosInstance> {
  const token = await getToken();
  if (!token) redirect("/login");

  const http = createHttp(token);
  http.interceptors.response.use(undefined, (error) => {
    if (error instanceof ApiError && error.status === 401) redirect("/login?expired=1");
    throw error;
  });
  return http;
}
