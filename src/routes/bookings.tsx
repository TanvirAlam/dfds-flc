import { useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Booking, BookingRow } from "@/domain/bookings/types";
import {
  EMPTY_FILTERS,
  matchesFilters,
  removeStatus,
  setCustomer,
  setSearch,
  setVessel,
} from "@/domain/bookings/filters";
import { useBookings } from "@/lib/hooks/useBookings";
import {
  useBookingsUrlState,
  validateBookingsSearch,
} from "@/lib/hooks/useBookingsUrlState";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsHeader } from "@/components/bookings/BookingsHeader";
import {
  BookingsEmpty,
  BookingsError,
  BookingsLoading,
} from "@/components/bookings/BookingsStates";
import { BookingDrawer } from "@/components/bookings/BookingDrawer";
import { FilteredEmpty } from "@/components/bookings/FilteredEmpty";
import { FilterBar } from "@/components/filters/FilterBar";
import { FilterChips } from "@/components/filters/FilterChips";

/**
 * Bookings page.
 *
 * Orchestrates three concerns, each delegated to a dedicated module:
 *   - URL state (filters + drawer open-id)  → `useBookingsUrlState`
 *   - Server data (list + lookups + upsert) → `useBookings`
 *   - Domain filtering                       → `matchesFilters`
 *
 * This component's job is to connect those outputs to their views.
 */

export const Route = createFileRoute("/bookings")({
  validateSearch: validateBookingsSearch,
  component: BookingsPage,
});

function BookingsPage() {
  const search = Route.useSearch();
  const {
    status,
    rows,
    customers,
    vessels,
    error,
    refetch,
    isRefetching,
    upsertBooking,
  } = useBookings();

  const {
    filters,
    drawerMode,
    drawerTarget,
    setFilters,
    openDrawer,
    closeDrawer,
  } = useBookingsUrlState(search);

  /* --------- derived data --------- */

  const editingBooking = useMemo(
    () =>
      drawerMode === "edit" && drawerTarget
        ? rows.find((r) => r.id === drawerTarget)
        : undefined,
    [drawerMode, drawerTarget, rows],
  );

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

  /* --------- stable handlers --------- */

  const handleRowActivate = useCallback(
    (row: BookingRow) => openDrawer(row.id),
    [openDrawer],
  );
  const handlePersisted = useCallback(
    (persisted: Booking) => upsertBooking(persisted),
    [upsertBooking],
  );
  const handleNewBooking = useCallback(() => openDrawer("new"), [openDrawer]);
  const clearAll = useCallback(
    () => setFilters(EMPTY_FILTERS),
    [setFilters],
  );

  // Chip removal handlers: declared once with stable identities so the
  // `FilterChips` component can be memoised in a follow-up.
  const onRemoveStatus = useCallback(
    (s: Parameters<typeof removeStatus>[1]) =>
      setFilters(removeStatus(filters, s)),
    [filters, setFilters],
  );
  const onClearCustomer = useCallback(
    () => setFilters(setCustomer(filters, null)),
    [filters, setFilters],
  );
  const onClearVessel = useCallback(
    () => setFilters(setVessel(filters, null)),
    [filters, setFilters],
  );
  const onClearSearch = useCallback(
    () => setFilters(setSearch(filters, "")),
    [filters, setFilters],
  );

  /* --------- render --------- */

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8">
      <BookingsHeader
        status={status}
        total={rows.length}
        filtered={filteredRows.length}
        isRefetching={isRefetching}
        onRefresh={refetch}
        onNewBooking={handleNewBooking}
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
              onRemoveStatus={onRemoveStatus}
              onClearCustomer={onClearCustomer}
              onClearVessel={onClearVessel}
              onClearSearch={onClearSearch}
              onClearAll={clearAll}
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
          <FilteredEmpty onClear={clearAll} />
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
