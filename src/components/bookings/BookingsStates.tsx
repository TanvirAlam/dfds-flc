import { Button } from "@/components/ui/Button";

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
            <Th className="w-32">Ref</Th>
            <Th className="w-56">Customer</Th>
            <Th className="w-40">Vessel</Th>
            <Th className="min-w-64">Route</Th>
            <Th className="w-40">Cargo</Th>
            <Th className="w-28 text-right">Weight</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-44">ETD</Th>
            <Th className="w-44">ETA</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className="h-12">
              <Cell>
                <SkeletonBar className="w-16" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-40" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-28" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-48" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-24" />
              </Cell>
              <Cell className="text-right">
                <SkeletonBar className="ml-auto w-16" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-20 rounded-full" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-28" />
              </Cell>
              <Cell>
                <SkeletonBar className="w-28" />
              </Cell>
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

function Th({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th scope="col" className={`px-3 py-2.5 align-middle ${className}`}>
      {children}
    </th>
  );
}

function Cell({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td className={`px-3 py-2.5 align-middle ${className}`}>{children}</td>
  );
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-3 rounded bg-slate-200 motion-safe:animate-pulse ${className}`}
    />
  );
}
