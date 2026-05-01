import type { AsyncStatus } from "@/lib/hooks/useBookings";
import { Button } from "@/components/ui/Button";

export function BookingsHeader({
  status,
  count,
  onRefresh,
}: {
  status: AsyncStatus;
  count: number;
  onRefresh: () => void;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Freight bookings across our vessels and terminals.
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        {status === "success" ? (
          <span aria-live="polite">
            {count} booking{count === 1 ? "" : "s"}
          </span>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={status === "loading"}
        >
          Refresh
        </Button>
      </div>
    </header>
  );
}
