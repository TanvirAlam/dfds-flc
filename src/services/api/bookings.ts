import type { Booking, Customer, Vessel } from "@/domain/bookings/types";
import { getJson, request } from "./http";
import type { CreateBookingInput, PatchBookingInput } from "./schemas";

/**
 * Bookings + lookup resources.
 *
 * A class rather than a plain object so we can:
 *   - carry a configurable `baseUrl` (useful for tests and a future
 *     mock server) without every call site re-concatenating strings,
 *   - keep each method typed against its exact input/output,
 *   - let consumers depend on the *shape* (`BookingsApi`) rather than
 *     a module, making dependency injection + faking straightforward.
 *
 * `bookingsApi` is the production singleton; tests can instantiate a
 * different one against a stub if they want.
 */
export class BookingsApi {
  constructor(private readonly baseUrl: string = "/api") {}

  listBookings(signal?: AbortSignal): Promise<Booking[]> {
    return getJson<Booking[]>(`${this.baseUrl}/bookings`, signal);
  }

  listCustomers(signal?: AbortSignal): Promise<Customer[]> {
    return getJson<Customer[]>(`${this.baseUrl}/customers`, signal);
  }

  listVessels(signal?: AbortSignal): Promise<Vessel[]> {
    return getJson<Vessel[]>(`${this.baseUrl}/vessels`, signal);
  }

  create(input: CreateBookingInput, signal?: AbortSignal): Promise<Booking> {
    return request<Booking>(
      `${this.baseUrl}/bookings`,
      { method: "POST", body: JSON.stringify(input) },
      signal,
    );
  }

  patch(
    id: string,
    input: PatchBookingInput,
    signal?: AbortSignal,
  ): Promise<Booking> {
    return request<Booking>(
      `${this.baseUrl}/bookings/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      signal,
    );
  }
}

/** Default singleton instance used throughout the app. */
export const bookingsApi = new BookingsApi();
