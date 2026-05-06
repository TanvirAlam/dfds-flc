import { Button } from "@/components/ui/Button";
import { Skeleton } from "@dfds-ui/navaigator";
import { toUserFacingMessage } from "@/lib/errors";

const SKELETON_ROWS = 8;

export function BookingsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="relative max-h-[calc(100vh-18rem)] min-h-64 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <table className="min-w-full border-collapse text-sm">
        <caption className="sr-only">Loading freight bookings</caption>
        <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-[inset_0_-1px_0_0_theme(colors.slate.200)]">
          <tr>
            <th scope="col" className="w-32 px-3 py-2.5 align-middle">
              Ref
            </th>
            <th scope="col" className="w-56 px-3 py-2.5 align-middle">
              Customer
            </th>
            <th scope="col" className="w-40 px-3 py-2.5 align-middle">
              Vessel
            </th>
            <th scope="col" className="min-w-64 px-3 py-2.5 align-middle">
              Route
            </th>
            <th scope="col" className="w-40 px-3 py-2.5 align-middle">
              Cargo
            </th>
            <th scope="col" className="w-28 px-3 py-2.5 align-middle text-right">
              Weight
            </th>
            <th scope="col" className="w-32 px-3 py-2.5 align-middle">
              Status
            </th>
            <th scope="col" className="w-44 px-3 py-2.5 align-middle">
              ETD
            </th>
            <th scope="col" className="w-44 px-3 py-2.5 align-middle">
              ETA
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className="h-12">
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-16 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-40 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-28 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-48 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-24 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle text-right">
                <Skeleton className="ml-auto h-3 w-16 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-20 rounded-full" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-28 rounded" />
              </td>
              <td className="px-3 py-2.5 align-middle">
                <Skeleton className="h-3 w-28 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading bookings</span>
    </div>
  );
}

export function BookingsEmpty() {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <h2 className="text-base font-semibold text-slate-900">
        No bookings yet
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        When the ops team books cargo onto a sailing, it will show up here.
      </p>
    </div>
  );
}

export function BookingsError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const ui = toUserFacingMessage(error);

  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{ui.title}</p>
          <p className="mt-1 text-rose-800/90">{ui.body}</p>
        </div>
        {ui.canRetry ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="shrink-0"
          >
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}