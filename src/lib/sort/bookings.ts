import type { BookingRow } from "@/lib/hooks/useBookings";
import type { SortDir, SortState } from "@/lib/hooks/useTableSort";
import { dateSortKey } from "@/lib/format";

export type BookingSortKey =
  | "departureAt"
  | "arrivalAt"
  | "customerName"
  | "status";

const STATUS_ORDER: Record<BookingRow["status"], number> = {
  pending: 0,
  confirmed: 1,
  in_transit: 2,
  delivered: 3,
  cancelled: 4,
};

export function defaultBookingSortDir(_key: BookingSortKey): SortDir {
  return "asc";
}

export function compareBookingRows(
  a: BookingRow,
  b: BookingRow,
  sort: SortState<BookingSortKey>,
): number {
  const mul = sort.dir === "asc" ? 1 : -1;
  switch (sort.key) {
    case "departureAt":
      return (dateSortKey(a.departureAt) - dateSortKey(b.departureAt)) * mul;
    case "arrivalAt":
      return (dateSortKey(a.arrivalAt) - dateSortKey(b.arrivalAt)) * mul;
    case "customerName":
      return a.customerName.localeCompare(b.customerName) * mul;
    case "status":
      return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * mul;
  }
}
