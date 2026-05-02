import type { AsyncStatus } from "@/lib/hooks/useBookings";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function BookingsHeader({
  status,
  total,
  filtered,
  isRefetching,
  onRefresh,
  onNewBooking,
}: {
  status: AsyncStatus;
  total: number;
  filtered: number;
  isRefetching: boolean;
  onRefresh: () => void;
  onNewBooking: () => void;
}) {
  const isFiltered = status === "success" && filtered !== total;

  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Freight bookings across our vessels and terminals.
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        {isRefetching ? (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
          >
            <Spinner size={12} />
            <span>Refreshing</span>
          </span>
        ) : null}

        {status === "success" ? (
          <span aria-live="polite" className="tabular-nums">
            {isFiltered
              ? `${filtered} of ${total} bookings`
              : `${total} booking${total === 1 ? "" : "s"}`}
          </span>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={status === "loading" || isRefetching}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNewBooking}
          disabled={status !== "success"}
        >
          New booking
        </Button>
      </div>
    </header>
  );
}
