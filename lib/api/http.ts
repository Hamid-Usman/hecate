import axios, { isAxiosError, type AxiosInstance } from "axios";
import { ApiError } from "../errors";
import { apiUrl } from "../session-shared";

/** Turn anything axios (or the code around it) throws into an ApiError with the backend's message. */
export function toApiError(error: unknown): Error {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    if (error.response) {
      const message = (error.response.data as { message?: string | string[] } | undefined)?.message;
      return new ApiError(error.response.status, Array.isArray(message) ? message.join(". ") : (message ?? `Request failed (${error.response.status})`));
    }
    // No response at all: backend down, DNS, or timeout.
    return new ApiError(503, "The Hecate control plane can’t be reached right now. Please try again in a moment.");
  }
  return error instanceof Error ? error : new ApiError(500, "Unexpected error");
}

/**
 * An axios instance pointed at hecates-backend. Every failure surfaces as an ApiError carrying the
 * backend's `{ statusCode, error, message }` message, so callers handle one error type.
 */
export function createHttp(token?: string, timeout = 30_000): AxiosInstance {
  const http = axios.create({
    baseURL: apiUrl(),
    timeout,
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      throw toApiError(error);
    },
  );
  return http;
}
