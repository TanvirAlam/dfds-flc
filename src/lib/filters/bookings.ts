import type { BookingStatus } from "@/lib/api/types";
import type { BookingRow } from "@/lib/hooks/useBookings";

export const ALL_BOOKING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export interface BookingFilters {
  statuses: BookingStatus[];
  customerId: string | null;
  vesselId: string | null;
  search: string;
}

export const EMPTY_FILTERS: BookingFilters = {
  statuses: [],
  customerId: null,
  vesselId: null,
  search: "",
};

export function isEmpty(f: BookingFilters): boolean {
  return (
    f.statuses.length === 0 &&
    f.customerId === null &&
    f.vesselId === null &&
    f.search.trim() === ""
  );
}

export function matchesFilters(row: BookingRow, f: BookingFilters): boolean {
  if (f.statuses.length > 0 && !f.statuses.includes(row.status)) return false;
  if (f.customerId !== null && row.customerId !== f.customerId) return false;
  if (f.vesselId !== null && row.vesselId !== f.vesselId) return false;

  const q = f.search.trim().toLowerCase();
  if (q !== "" && !row.id.toLowerCase().includes(q)) return false;

  return true;
}

export interface BookingsSearchParams {
  status?: string;
  customerId?: string;
  vesselId?: string;
  q?: string;
}

const STATUS_SET = new Set<BookingStatus>(ALL_BOOKING_STATUSES);

export function parseSearch(search: BookingsSearchParams): BookingFilters {
  const statuses = (search.status ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is BookingStatus => STATUS_SET.has(s as BookingStatus));

  return {
    statuses,
    customerId: nonEmpty(search.customerId),
    vesselId: nonEmpty(search.vesselId),
    search: (search.q ?? "").trim(),
  };
}

export function filtersToSearch(f: BookingFilters): BookingsSearchParams {
  return {
    status: f.statuses.length > 0 ? f.statuses.join(",") : undefined,
    customerId: f.customerId ?? undefined,
    vesselId: f.vesselId ?? undefined,
    q: f.search.trim() !== "" ? f.search.trim() : undefined,
  };
}

function nonEmpty(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function toggleStatus(
  f: BookingFilters,
  status: BookingStatus,
): BookingFilters {
  return f.statuses.includes(status)
    ? { ...f, statuses: f.statuses.filter((s) => s !== status) }
    : { ...f, statuses: [...f.statuses, status] };
}

export function setCustomer(
  f: BookingFilters,
  customerId: string | null,
): BookingFilters {
  return { ...f, customerId };
}

export function setVessel(
  f: BookingFilters,
  vesselId: string | null,
): BookingFilters {
  return { ...f, vesselId };
}

export function setSearch(f: BookingFilters, search: string): BookingFilters {
  return { ...f, search };
}

export function removeStatus(
  f: BookingFilters,
  status: BookingStatus,
): BookingFilters {
  return { ...f, statuses: f.statuses.filter((s) => s !== status) };
}
