import { ApiError, classifyStatus } from "./errors";

/**
 * Generic HTTP helper for the SPA's internal API.
 *
 * Wraps `fetch` and maps HTTP outcomes to typed `ApiError`s:
 *   - fetch rejects → `ApiError{ kind: "network", status: null }`.
 *   - 4xx / 5xx → `ApiError` with the classified `kind` and parsed body.
 *   - AbortError → re-thrown as-is so callers can filter it.
 *
 * All API modules (e.g. `BookingsApi`) build on top of this. They only
 * care about endpoints; transport + error shape lives here.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError({
      kind: "network",
      status: null,
      message:
        err instanceof Error
          ? err.message
          : `Network error requesting ${path}`,
      body: null,
      path,
    });
  }

  // 204 No Content — nothing to parse.
  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* body may not be JSON; fine */
    }
    const message =
      (body as { error?: string } | null)?.error ??
      `Request to ${path} failed with ${res.status}`;
    throw new ApiError({
      kind: classifyStatus(res.status),
      status: res.status,
      message,
      body,
      path,
    });
  }

  return (await res.json()) as T;
}

export const getJson = <T>(path: string, signal?: AbortSignal) =>
  request<T>(path, {}, signal);
