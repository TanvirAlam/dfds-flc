import { createFileRoute } from "@tanstack/react-router";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsHeader } from "@/components/bookings/BookingsHeader";
import {
  BookingsEmpty,
  BookingsError,
  BookingsLoading,
} from "@/components/bookings/BookingsStates";
import { useBookings } from "@/lib/hooks/useBookings";

export const Route = createFileRoute("/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { status, rows, error, refetch } = useBookings();

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-8">
      <BookingsHeader
        status={status}
        count={rows.length}
        onRefresh={refetch}
      />

      {status === "loading" || status === "idle" ? <BookingsLoading /> : null}

      {status === "error" && error ? (
        <BookingsError error={error} onRetry={refetch} />
      ) : null}

      {status === "success" ? (
        rows.length === 0 ? (
          <BookingsEmpty />
        ) : (
          <BookingsTable rows={rows} />
        )
      ) : null}
    </main>
  );
}
