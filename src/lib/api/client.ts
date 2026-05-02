import type { Booking, Customer, Vessel } from "./types";
import type {
  CreateBookingInput,
  PatchBookingInput,
} from "./schemas";

/**
 * What went wrong at the HTTP layer.
 *
 * - `network`    — fetch rejected (DNS, CORS, server down, offline, …).
 *                  No status code.
 * - `validation` — server returned 4xx with a field-shaped body. Handled
 *                  by form code; not shown to users as a root error.
 * - `client`     — other 4xx (404, 403, 401 …). User-correctable but not
 *                  field-level.
 * - `server`     — 5xx. Not the user's fault. Suggest retry.
 * - `unknown`    — we don't have a better box for it.
 */
export type ApiErrorKind =
  | "network"
  | "validation"
  | "client"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** `null` for `network` errors that never reached the server. */
  readonly status: number | null;
  /** The parsed response body, if any. Useful for form field mapping. */
  readonly body: unknown;
  /** The request path, for logging. */
  readonly path: string;

  constructor(args: {
    kind: ApiErrorKind;
    status: number | null;
    message: string;
    body: unknown;
    path: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.kind = args.kind;
    this.status = args.status;
    this.body = args.body;
    this.path = args.path;
  }
}

async function request<T>(
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
    // `fetch` only throws for network-level failures (offline, CORS,
    // aborted). Re-throw `AbortError` unchanged so callers can filter it;
    // wrap anything else as a `network` `ApiError`.
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
      /* ignore — body may not be JSON */
    }
    const kind: ApiErrorKind =
      res.status >= 500
        ? "server"
        : res.status === 400
          ? "validation"
          : res.status >= 400
            ? "client"
            : "unknown";
    const message =
      (body as { error?: string } | null)?.error ??
      `Request to ${path} failed with ${res.status}`;
    throw new ApiError({
      kind,
      status: res.status,
      message,
      body,
      path,
    });
  }

  return (await res.json()) as T;
}

const getJson = <T>(path: string, signal?: AbortSignal) =>
  request<T>(path, {}, signal);

export const api = {
  listBookings: (signal?: AbortSignal) =>
    getJson<Booking[]>("/api/bookings", signal),
  listCustomers: (signal?: AbortSignal) =>
    getJson<Customer[]>("/api/customers", signal),
  listVessels: (signal?: AbortSignal) =>
    getJson<Vessel[]>("/api/vessels", signal),

  createBooking: (input: CreateBookingInput, signal?: AbortSignal) =>
    request<Booking>(
      "/api/bookings",
      { method: "POST", body: JSON.stringify(input) },
      signal,
    ),

  patchBooking: (
    id: string,
    input: PatchBookingInput,
    signal?: AbortSignal,
  ) =>
    request<Booking>(
      `/api/bookings/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      signal,
    ),
};
