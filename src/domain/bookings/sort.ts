import { dateSortKey } from "@/lib/format";
import type { SortState } from "@/lib/hooks/useTableSort";
import { statusPresenter } from "./status";
import type { BookingRow } from "./types";

/**
 * Pure comparators for `BookingRow`s.
 *
 * Keys the UI exposes as sortable columns. Status ordering is delegated
 * to the single source of truth (`statusPresenter`) so the pipeline
 * rank never disagrees across the app.
 */

export type BookingSortKey =
  | "departureAt"
  | "arrivalAt"
  | "customerName"
  | "status";

export function defaultBookingSortDir(_key: BookingSortKey) {
  return "asc" as const;
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
      return (
        (statusPresenter(a.status).order - statusPresenter(b.status).order) *
        mul
      );
  }
}
