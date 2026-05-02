import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Booking,
  BookingRow,
  Customer,
  Vessel,
} from "@/domain/bookings/types";
import { bookingsApi } from "@/services/api";
import { reportError } from "@/lib/errors";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface UseBookingsResult {
  status: AsyncStatus;
  rows: BookingRow[];
  customers: Customer[];
  vessels: Vessel[];
  error: Error | null;
  refetch: () => void;
  /**
   * True while a background refetch is in flight *but* we already have
   * data to show. Enables non-blocking indicators.
   */
  isRefetching: boolean;
  /**
   * Insert or replace a booking in the local cache. Used by the
   * create/edit flow to reflect a successful server write without a
   * full refetch.
   */
  upsertBooking: (booking: Booking) => void;
}

/**
 * Loads bookings + lookup tables (customers, vessels) in parallel and
 * joins names into each row.
 *
 * First load: flips `status` to `"loading"` so the UI renders a
 * skeleton. Subsequent refetches: `status` stays `"success"` and
 * `isRefetching` toggles instead, so existing data remains on screen
 * (non-blocking refresh).
 */
export function useBookings(): UseBookingsResult {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  const upsertBooking = useCallback((booking: Booking) => {
    setBookings((prev) => {
      const idx = prev.findIndex((b) => b.id === booking.id);
      if (idx === -1) return [booking, ...prev];
      const copy = prev.slice();
      copy[idx] = booking;
      return copy;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const hasData = bookings.length > 0;

    if (!hasData) setStatus("loading");
    else setIsRefetching(true);
    setError(null);

    (async () => {
      try {
        const [bookingsRes, customersRes, vesselsRes] = await Promise.allSettled([
          bookingsApi.listBookings(controller.signal),
          bookingsApi.listCustomers(controller.signal),
          bookingsApi.listVessels(controller.signal),
        ]);

        if (controller.signal.aborted) return;

        if (bookingsRes.status === "rejected") {
          throw bookingsRes.reason instanceof Error
            ? bookingsRes.reason
            : new Error(String(bookingsRes.reason));
        }

        setBookings(bookingsRes.value);
        setCustomers(
          customersRes.status === "fulfilled" ? customersRes.value : [],
        );
        setVessels(
          vesselsRes.status === "fulfilled" ? vesselsRes.value : [],
        );
        setStatus("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;

        reportError("useBookings.fetch", err);

        setError(err instanceof Error ? err : new Error(String(err)));
        // Keep stale data if we have it; surface error as a banner.
        setStatus(hasData ? "success" : "error");
      } finally {
        if (!controller.signal.aborted) setIsRefetching(false);
      }
    })();

    return () => controller.abort();
    // Intentionally only re-runs on refetch. `bookings.length` is
    // captured via `hasData` closure and shouldn't trigger re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken]);

  const rows = useMemo<BookingRow[]>(
    () => joinRows(bookings, customers, vessels),
    [bookings, customers, vessels],
  );

  return {
    status,
    rows,
    customers,
    vessels,
    error,
    refetch,
    isRefetching,
    upsertBooking,
  };
}

/**
 * Pure row-projection. Extracted so it can be unit-tested without
 * React, and so the `rows` memo has a single referential dependency.
 */
function joinRows(
  bookings: Booking[],
  customers: Customer[],
  vessels: Vessel[],
): BookingRow[] {
  const customersById = new Map(customers.map((c) => [c.id, c]));
  const vesselsById = new Map(vessels.map((v) => [v.id, v]));

  return bookings.map((b) => ({
    ...b,
    customerName: customersById.get(b.customerId)?.name ?? b.customerId,
    vesselName: vesselsById.get(b.vesselId)?.name ?? b.vesselId,
  }));
}
