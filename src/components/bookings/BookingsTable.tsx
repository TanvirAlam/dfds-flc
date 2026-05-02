import { memo, useMemo, type KeyboardEvent } from "react";
import type { BookingRow } from "@/lib/hooks/useBookings";
import { formatDateTime, formatWeightKg } from "@/lib/format";
import { useTableSort } from "@/lib/hooks/useTableSort";
import {
  type BookingSortKey,
  compareBookingRows,
  defaultBookingSortDir,
} from "@/lib/sort/bookings";
import { Th, SortableTh, Td, TruncatedText } from "@/components/ui/Table";
import { StatusBadge } from "./StatusBadge";

export function BookingsTable({
  rows,
  onRowActivate,
}: {
  rows: BookingRow[];
  onRowActivate?: (row: BookingRow) => void;
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
            <BookingRowView key={row.id} row={row} onActivate={onRowActivate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BookingRowView = memo(function BookingRowView({
  row,
  onActivate,
}: {
  row: BookingRow;
  onActivate?: (row: BookingRow) => void;
}) {
  const activatable = Boolean(onActivate);

  function handleKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (!onActivate) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate(row);
    }
  }

  return (
    <tr
      tabIndex={0}
      role={activatable ? "button" : undefined}
      aria-label={activatable ? `Open booking ${row.id}` : `Booking ${row.id}`}
      onClick={activatable ? () => onActivate?.(row) : undefined}
      onKeyDown={handleKeyDown}
      className={
        "group h-12 outline-none transition-colors " +
        "hover:bg-slate-50 focus-visible:bg-sky-50 " +
        "focus-visible:shadow-[inset_2px_0_0_0_theme(colors.sky.500)] " +
        (activatable ? "cursor-pointer" : "")
      }
    >
      <Td>
        <span className="font-mono text-xs text-slate-700" title={row.id}>
          {row.id}
        </span>
      </Td>
      <Td>
        <TruncatedText value={row.customerName} maxWidth="max-w-[14rem]" />
      </Td>
      <Td>
        <TruncatedText value={row.vesselName} maxWidth="max-w-[10rem]" />
      </Td>
      <Td>
        <div className="flex items-center gap-2 text-slate-700">
          <TruncatedText value={row.origin} maxWidth="max-w-[8rem]" />
          <span aria-hidden className="text-slate-400">
            →
          </span>
          <TruncatedText value={row.destination} maxWidth="max-w-[8rem]" />
        </div>
      </Td>
      <Td>
        <TruncatedText value={row.cargoType} maxWidth="max-w-[10rem]" />
      </Td>
      <Td className="text-right tabular-nums">
        {formatWeightKg(row.weightKg)}
      </Td>
      <Td>
        <StatusBadge status={row.status} />
      </Td>
      <Td className="tabular-nums text-slate-700">
        {formatDateTime(row.departureAt)}
      </Td>
      <Td className="tabular-nums text-slate-700">
        {formatDateTime(row.arrivalAt)}
      </Td>
      {activatable ? (
        <Td className="text-right">
          <span
            aria-hidden
            className="inline-block text-slate-300 transition-opacity group-hover:text-slate-600 group-focus-visible:text-slate-900"
          >
            ›
          </span>
        </Td>
      ) : null}
    </tr>
  );
});
