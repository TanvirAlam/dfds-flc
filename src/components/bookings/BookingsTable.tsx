import { useMemo } from "react";
import type { BookingRow as BookingRowData } from "@/domain/bookings/types";
import {
  compareBookingRows,
  defaultBookingSortDir,
  type BookingSortKey,
} from "@/domain/bookings/sort";
import { useTableSort } from "@/lib/hooks/useTableSort";
import { SortableTh, Th } from "@/components/ui/Table";
import { BookingRow } from "./BookingRow";

/**
 * Bookings data table.
 *
 * SRP: layout + sort orchestration. Row rendering lives in
 * `BookingRow.tsx`, the comparator in `@/domain/bookings/sort`. This
 * file just decides which column the user sorts by and passes the
 * sorted rows down.
 */
export function BookingsTable({
  rows,
  onRowActivate,
}: {
  rows: BookingRowData[];
  onRowActivate?: (row: BookingRowData) => void;
}) {
  const { sort, toggle } = useTableSort<BookingSortKey>(
    "departureAt",
    "asc",
    defaultBookingSortDir,
  );

  const sortedRows = useMemo(() => {
    const copy = rows.slice();
    copy.sort((a, b) => compareBookingRows(a, b, sort));
    return copy;
  }, [rows, sort]);

  const showActivate = Boolean(onRowActivate);

  return (
    <div className="relative max-h-[calc(100vh-18rem)] min-h-64 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <caption className="sr-only">Freight bookings</caption>
        <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-[inset_0_-1px_0_0_theme(colors.slate.200)]">
          <tr>
            <Th scope="col" className="w-32">
              Ref
            </Th>
            <SortableTh
              scope="col"
              sort={sort}
              sortKey="customerName"
              onToggle={toggle}
              className="w-56"
            >
              Customer
            </SortableTh>
            <Th scope="col" className="w-40">
              Vessel
            </Th>
            <Th scope="col" className="min-w-64">
              Route
            </Th>
            <Th scope="col" className="w-40">
              Cargo
            </Th>
            <Th scope="col" className="w-28 text-right">
              Weight
            </Th>
            <SortableTh
              scope="col"
              sort={sort}
              sortKey="status"
              onToggle={toggle}
              className="w-32"
            >
              Status
            </SortableTh>
            <SortableTh
              scope="col"
              sort={sort}
              sortKey="departureAt"
              onToggle={toggle}
              className="w-44"
            >
              ETD
            </SortableTh>
            <SortableTh
              scope="col"
              sort={sort}
              sortKey="arrivalAt"
              onToggle={toggle}
              className="w-44"
            >
              ETA
            </SortableTh>
            {showActivate ? (
              <Th scope="col" className="w-10">
                <span className="sr-only">Open</span>
              </Th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedRows.map((row) => (
            <BookingRow key={row.id} row={row} onActivate={onRowActivate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
