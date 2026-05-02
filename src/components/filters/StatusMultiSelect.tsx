import type { BookingStatus } from "@/domain/bookings/types";
import { ALL_BOOKING_STATUSES } from "@/domain/bookings/status";
import { StatusBadge } from "@/components/bookings/StatusBadge";

export function StatusMultiSelect({
  selected,
  onToggle,
}: {
  selected: BookingStatus[];
  onToggle: (status: BookingStatus) => void;
}) {
  const set = new Set(selected);
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-xs font-medium uppercase tracking-wide text-slate-600">
        Status
      </legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {ALL_BOOKING_STATUSES.map((status) => {
          const active = set.has(status);
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(status)}
              className={
                "rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 " +
                (active
                  ? "opacity-100"
                  : "opacity-60 grayscale hover:opacity-100 hover:grayscale-0")
              }
            >
              <StatusBadge status={status} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
