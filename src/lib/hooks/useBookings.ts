import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Booking, Customer, Vessel } from "@/lib/api/types";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface BookingRow extends Booking {
  customerName: string;
  vesselName: string;
}

export interface UseBookingsResult {
  status: AsyncStatus;
  rows: BookingRow[];
  customers: Customer[];
  vessels: Vessel[];
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
  upsertBooking: (booking: Booking) => void;
}

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
    if (!hasData) {
      setStatus("loading");
    } else {
      setIsRefetching(true);
    }
    setError(null);

    (async () => {
      try {
        const [bookingsRes, customersRes, vesselsRes] = await Promise.allSettled([
          api.listBookings(controller.signal),
          api.listCustomers(controller.signal),
          api.listVessels(controller.signal),
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

        const normalised =
          err instanceof ApiError || err instanceof Error
            ? err
            : new Error(String(err));
        setError(normalised);
        setStatus(hasData ? "success" : "error");
      } finally {
        if (!controller.signal.aborted) {
          setIsRefetching(false);
        }
      }
    })();

    return () => controller.abort();

  }, [reloadToken]);

  const rows = useMemo<BookingRow[]>(() => {
    const customersById = new Map(customers.map((c) => [c.id, c]));
    const vesselsById = new Map(vessels.map((v) => [v.id, v]));

    return bookings.map((b) => ({
      ...b,
      customerName: customersById.get(b.customerId)?.name ?? b.customerId,
      vesselName: vesselsById.get(b.vesselId)?.name ?? b.vesselId,
    }));
  }, [bookings, customers, vessels]);

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
