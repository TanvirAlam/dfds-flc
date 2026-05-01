import type { Booking, Customer, Vessel } from "./types";

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

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, {
    signal,
    headers: { Accept: "application/json" },
  });

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

export const api = {
  listBookings: (signal?: AbortSignal) =>
    getJson<Booking[]>("/api/bookings", signal),
  listCustomers: (signal?: AbortSignal) =>
    getJson<Customer[]>("/api/customers", signal),
  listVessels: (signal?: AbortSignal) =>
    getJson<Vessel[]>("/api/vessels", signal),
};
