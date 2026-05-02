import { memo, type KeyboardEvent } from "react";
import type { BookingRow as BookingRowData } from "@/domain/bookings/types";
import { formatDateTime, formatWeightKg } from "@/lib/format";
import { Td, TruncatedText } from "@/components/ui/Table";
import { StatusBadge } from "./StatusBadge";

/**
 * Renders a single bookings row.
 *
 * Memoised on value equality so filter/sort changes don't re-render rows
 * that didn't change. Pairs naturally with stable `onActivate` from the
 * parent (`useCallback` upstream).
 */
export const BookingRow = memo(function BookingRow({
  row,
  onActivate,
}: {
  row: BookingRowData;
  onActivate?: (row: BookingRowData) => void;
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
