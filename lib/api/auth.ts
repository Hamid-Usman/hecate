import { createHttp } from "./http";

/** What /v1/auth/* returns. */
export interface Session {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: { id: string; email: string; name?: string };
}

/** POST /v1/auth/login */
export async function login(email: string, password: string): Promise<Session> {
  return (await createHttp().post<Session>("/v1/auth/login", { email, password })).data;
}

/** POST /v1/auth/register. Also signs the new user in. */
export async function register(input: { email: string; password: string; name?: string }): Promise<Session> {
  return (await createHttp().post<Session>("/v1/auth/register", input)).data;
}

/** POST /v1/auth/refresh: a fresh token for a still-valid one. Takes the token directly so the proxy can use it. */
export async function refresh(token: string): Promise<Session> {
  return (await createHttp(token, 3_000).post<Session>("/v1/auth/refresh")).data;
}
