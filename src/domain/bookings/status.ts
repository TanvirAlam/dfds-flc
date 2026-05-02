import type { BookingStatus } from "./types";

/**
 * Display metadata for a booking status. Single source of truth for
 * labels, CSS design-token names, and sort priority.
 *
 * UI pieces (`StatusBadge`, filter toggles, chips) read from this via
 * `statusPresenter(status)` instead of duplicating lookup tables. If we
 * add a sixth status, this is the only file to edit.
 */

interface StatusInfo {
  /** Human-readable label. */
  readonly label: string;
  /** The token suffix — e.g. `in-transit` maps to `--status-in-transit-*`. */
  readonly token: string;
  /**
   * Sort priority: lower = earlier in the booking lifecycle. Consumed by
   * the table sort comparator, so ordering by status walks the pipeline.
   */
  readonly order: number;
}

export const ALL_BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

const INFO: Record<BookingStatus, StatusInfo> = {
  pending: { label: "Pending", token: "pending", order: 0 },
  confirmed: { label: "Confirmed", token: "confirmed", order: 1 },
  in_transit: { label: "In transit", token: "in-transit", order: 2 },
  delivered: { label: "Delivered", token: "delivered", order: 3 },
  cancelled: { label: "Cancelled", token: "cancelled", order: 4 },
};

export function statusPresenter(status: BookingStatus): StatusInfo {
  return INFO[status];
}

/** Shortcut used by the form's `<option>` list. */
export function statusLabel(status: BookingStatus): string {
  return INFO[status].label;
}
