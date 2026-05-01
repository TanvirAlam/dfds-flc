import { Button } from "@/components/ui/Button";

export function BookingsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Loading bookings…
      </div>
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-3">
            <SkeletonBar className="w-24" />
            <SkeletonBar className="w-48" />
            <SkeletonBar className="w-28" />
            <SkeletonBar className="ml-auto w-20" />
            <SkeletonBar className="w-24" />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading</span>
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
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Could not load bookings.</p>
          <p className="mt-1 text-rose-800/90">{error.message}</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          className="shrink-0"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-3 animate-pulse rounded bg-slate-200 ${className}`}
    />
  );
}
