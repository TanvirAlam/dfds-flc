import type { BookingStatus } from "@/lib/api/types";
import type { BookingFilters } from "@/lib/filters/bookings";
import { isEmpty } from "@/lib/filters/bookings";

export function FilterChips({
  filters,
  customerLabel,
  vesselLabel,
  onRemoveStatus,
  onClearCustomer,
  onClearVessel,
  onClearSearch,
  onClearAll,
}: {
  filters: BookingFilters;
  customerLabel: string | null;
  vesselLabel: string | null;
  onRemoveStatus: (status: BookingStatus) => void;
  onClearCustomer: () => void;
  onClearVessel: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}) {
  const empty = isEmpty(filters);

  return (
    <div
      className="flex min-h-9 flex-wrap items-center gap-1.5"
      aria-live="polite"
    >
      {empty ? (
        <span className="text-xs text-slate-400">No filters applied</span>
      ) : (
        <>
          {filters.statuses.map((s) => (
            <Chip
              key={`status-${s}`}
              label={`Status: ${humaniseStatus(s)}`}
              onRemove={() => onRemoveStatus(s)}
            />
          ))}
          {filters.customerId ? (
            <Chip
              label={`Customer: ${customerLabel ?? filters.customerId}`}
              onRemove={onClearCustomer}
            />
          ) : null}
          {filters.vesselId ? (
            <Chip
              label={`Vessel: ${vesselLabel ?? filters.vesselId}`}
              onRemove={onClearVessel}
            />
          ) : null}
          {filters.search.trim() !== "" ? (
            <Chip
              label={`Ref: "${filters.search.trim()}"`}
              onRemove={onClearSearch}
            />
          ) : null}
          <button
            type="button"
            onClick={onClearAll}
            className="ml-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 underline-offset-2 outline-none hover:text-slate-900 hover:underline focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-200">
      <span className="max-w-[16rem] truncate" title={label}>
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 outline-none transition hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <span aria-hidden>×</span>
      </button>
    </span>
  );
}

function humaniseStatus(s: BookingStatus): string {
  switch (s) {
    case "in_transit":
      return "In transit";
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
