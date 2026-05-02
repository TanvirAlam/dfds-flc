import { useCallback, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsHeader } from "@/components/bookings/BookingsHeader";
import {
  BookingsEmpty,
  BookingsError,
  BookingsLoading,
} from "@/components/bookings/BookingsStates";
import { BookingDrawer } from "@/components/bookings/BookingDrawer";
import { FilterBar } from "@/components/filters/FilterBar";
import { FilterChips } from "@/components/filters/FilterChips";
import type { BookingRow } from "@/lib/hooks/useBookings";
import type { Booking } from "@/lib/api/types";
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

/**
 * URL is the source of truth for filter state *and* drawer state.
 *
 * `?edit=new` → create drawer.
 * `?edit=bkg_05` → edit drawer for that booking.
 * (any other value / absent) → no drawer.
 *
 * Consequences:
 *   - Share a link with `?edit=bkg_05` and it opens on that row.
 *   - Browser Back closes the drawer (doesn't navigate away).
 *   - Reload-safe.
 */
interface BookingsSearch extends BookingsSearchParams {
  edit?: string;
}

export const Route = createFileRoute("/bookings")({
  validateSearch: (search: Record<string, unknown>): BookingsSearch => ({
    status: typeof search.status === "string" ? search.status : undefined,
    customerId:
      typeof search.customerId === "string" ? search.customerId : undefined,
    vesselId: typeof search.vesselId === "string" ? search.vesselId : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { status, rows, customers, vessels, error, refetch, upsertBooking } =
    useBookings();

  const filters: BookingFilters = useMemo(() => parseSearch(search), [search]);

  function setFilters(next: BookingFilters) {
    // Keep `edit` sticky across filter changes so typing doesn't close the drawer.
    navigate({
      search: { ...filtersToSearch(next), edit: search.edit },
      replace: true,
    });
  }

  /* ---------------- drawer state derived from URL ---------------- */

  const drawerMode: "create" | "edit" | null = search.edit
    ? search.edit === "new"
      ? "create"
      : "edit"
    : null;

  const editingBooking = useMemo(() => {
    if (drawerMode !== "edit") return undefined;
    return rows.find((r) => r.id === search.edit);
  }, [drawerMode, rows, search.edit]);

  const openDrawer = useCallback(
    (target: "new" | string) => {
      navigate({ search: { ...search, edit: target } });
    },
    [navigate, search],
  );

  const closeDrawer = useCallback(() => {
    // Strip `edit` from the URL; keep filters.
    const { edit: _drop, ...rest } = search;
    navigate({ search: rest, replace: false });
  }, [navigate, search]);

  const handlePersisted = useCallback(
    (persisted: Booking) => {
      upsertBooking(persisted);
    },
    [upsertBooking],
  );

  /* ---------------- row activation = open edit drawer ------------- */

  const handleRowActivate = useCallback(
    (row: BookingRow) => {
      openDrawer(row.id);
    },
    [openDrawer],
  );

  /* ---------------- filtered rows + chip labels ------------------- */

  const filteredRows = useMemo(
    () => rows.filter((r) => matchesFilters(r, filters)),
    [rows, filters],
  );

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
        onNewBooking={() => openDrawer("new")}
      />

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
          <BookingsTable
            rows={filteredRows}
            onRowActivate={handleRowActivate}
          />
        )
      ) : null}

      <BookingDrawer
        open={drawerMode !== null}
        mode={drawerMode ?? "create"}
        booking={editingBooking}
        customers={customers}
        vessels={vessels}
        onDismiss={closeDrawer}
        onPersisted={handlePersisted}
      />
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
