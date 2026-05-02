import type { Booking, Customer, Vessel } from "./types";
import type {
  CreateBookingInput,
  PatchBookingInput,
} from "./schemas";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    signal,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  // 204 No Content — nothing to parse.
  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      (body as { error?: string } | null)?.error ??
      `Request to ${path} failed with ${res.status}`;
    throw new ApiError(res.status, message, body);
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
