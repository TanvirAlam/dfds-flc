/**
 * Empty state shown when the bookings list has data but no rows match
 * the current filters. Distinct from `BookingsEmpty`, which is shown
 * when there are truly no bookings at all.
 */
export function FilteredEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center"
    >
      <h2 className="text-base font-semibold text-slate-900">
        No bookings match these filters
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Try widening the search or{" "}
        <button
          type="button"
          onClick={onClear}
          className="rounded text-sky-700 underline underline-offset-2 outline-none hover:text-sky-900 focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          clear all filters
        </button>
        .
      </p>
    </div>
  );
}
