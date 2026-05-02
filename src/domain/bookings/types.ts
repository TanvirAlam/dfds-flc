/**
 * Booking domain types.
 *
 * These are the *source of truth* for how the client models bookings.
 * Lives under `domain/` (not `lib/api/`) because the model is a business
 * concept, not a transport concern — the HTTP shape happens to match, but
 * if it ever diverges, a service-layer adapter should translate.
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: number;
  status: BookingStatus;
  /** ISO-8601. */
  departureAt: string;
  /** ISO-8601. */
  arrivalAt: string;
  /** ISO-8601. */
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
}

export interface Vessel {
  id: string;
  name: string;
  capacityTeu: number;
}

/**
 * A `Booking` with related lookup names already resolved. This is the
 * shape the table (and any future detail/edit views) render directly —
 * keeps the UI free of id→name joins.
 */
export interface BookingRow extends Booking {
  customerName: string;
  vesselName: string;
}
