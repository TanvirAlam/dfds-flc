import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsHeader } from "@/components/bookings/BookingsHeader";
import {
  BookingsEmpty,
  BookingsError,
  BookingsLoading,
} from "@/components/bookings/BookingsStates";
import { FilterBar } from "@/components/filters/FilterBar";
import { FilterChips } from "@/components/filters/FilterChips";
import { useBookings } from "@/lib/hooks/useBookings";
import {
  EMPTY_FILTERS,
  filtersToSearch,
  matchesFilters,
  parseSearch,
  removeStatus,
  setCustomer,
  setSearch,
  setVessel,
  type BookingFilters,
  type BookingsSearchParams,
} from "@/lib/filters/bookings";

export const Route = createFileRoute("/bookings")({
  // Loose schema: accept unknown strings, ignore what we can't understand.
  // Keeps share-links forgiving and future-proof (unknown keys drop out).
  validateSearch: (search: Record<string, unknown>): BookingsSearchParams => ({
    status: typeof search.status === "string" ? search.status : undefined,
    customerId:
      typeof search.customerId === "string" ? search.customerId : undefined,
    vesselId: typeof search.vesselId === "string" ? search.vesselId : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { status, rows, customers, vessels, error, refetch } = useBookings();

  // URL is the source of truth. Parse once per search change.
  const filters: BookingFilters = useMemo(() => parseSearch(search), [search]);

  function setFilters(next: BookingFilters) {
    // `replace: true` — typing into the search box shouldn't spam history.
    // Users can still share the URL; browser Back jumps out of the view.
    navigate({ search: filtersToSearch(next), replace: true });
  }

  const filteredRows = useMemo(
    () => rows.filter((r) => matchesFilters(r, filters)),
    [rows, filters],
  );

  // Chip labels need names, not ids.
  const customerLabel = useMemo(
    () =>
      filters.customerId
        ? (customers.find((c) => c.id === filters.customerId)?.name ?? null)
        : null,
    [filters.customerId, customers],
  );
  const vesselLabel = useMemo(
    () =>
      filters.vesselId
        ? (vessels.find((v) => v.id === filters.vesselId)?.name ?? null)
        : null,
    [filters.vesselId, vessels],
  );

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8">
      <BookingsHeader
        status={status}
        total={rows.length}
        filtered={filteredRows.length}
        onRefresh={refetch}
      />

      {/* Filter UI is rendered on success so we have customer/vessel lists
          to populate the dropdowns. While loading/errored we hide it rather
          than show empty dropdowns that can't be used. */}
      {status === "success" ? (
        <>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            customers={customers}
            vessels={vessels}
          />
          <div className="mb-4">
            <FilterChips
              filters={filters}
              customerLabel={customerLabel}
              vesselLabel={vesselLabel}
              onRemoveStatus={(s) => setFilters(removeStatus(filters, s))}
              onClearCustomer={() => setFilters(setCustomer(filters, null))}
              onClearVessel={() => setFilters(setVessel(filters, null))}
              onClearSearch={() => setFilters(setSearch(filters, ""))}
              onClearAll={() => setFilters(EMPTY_FILTERS)}
            />
          </div>
        </>
      ) : null}

      {status === "loading" || status === "idle" ? <BookingsLoading /> : null}

      {status === "error" && error ? (
        <BookingsError error={error} onRetry={refetch} />
      ) : null}

      {status === "success" ? (
        rows.length === 0 ? (
          <BookingsEmpty />
        ) : filteredRows.length === 0 ? (
          <FilteredEmpty onClear={() => setFilters(EMPTY_FILTERS)} />
        ) : (
          <BookingsTable rows={filteredRows} />
        )
      ) : null}
    </main>
  );
}

function FilteredEmpty({ onClear }: { onClear: () => void }) {
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
