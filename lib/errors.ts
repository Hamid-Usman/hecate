/** Safe to import from client components: no server-only code here. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * What a Server Action returns. Errors are returned, not thrown, because Next hides thrown error
 * messages from the browser in production.
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

/** Turn a result back into a value, or throw an ApiError the caller's catch block can inspect. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new ApiError(result.status, result.message);
  return result.data;
}
