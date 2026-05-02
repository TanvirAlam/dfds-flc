import {
  compareBookingRows,
  defaultBookingSortDir,
  type BookingSortKey,
} from "@/lib/sort/bookings";
import type { BookingRow } from "@/lib/hooks/useBookings";
import type { SortState } from "@/lib/hooks/useTableSort";

function row(overrides: Partial<BookingRow> = {}): BookingRow {
  return {
    id: "bkg_01",
    customerId: "cus_01",
    vesselId: "ves_01",
    customerName: "Acme",
    vesselName: "MV Star",
    origin: "Copenhagen",
    destination: "Brevik",
    cargoType: "general",
    weightKg: 1000,
    status: "pending",
    departureAt: "2026-05-01T08:00:00Z",
    arrivalAt: "2026-05-02T08:00:00Z",
    createdAt: "2026-04-01T00:00:00Z",
    ...overrides,
  };
}

function sort(rows: BookingRow[], s: SortState<BookingSortKey>): BookingRow[] {
  return rows.slice().sort((a, b) => compareBookingRows(a, b, s));
}

describe("compareBookingRows", () => {
  it("sorts by departure ascending (soonest first)", () => {
    const rows = [
      row({ id: "a", departureAt: "2026-05-10T00:00:00Z" }),
      row({ id: "b", departureAt: "2026-05-05T00:00:00Z" }),
      row({ id: "c", departureAt: "2026-05-01T00:00:00Z" }),
    ];
    const ids = sort(rows, { key: "departureAt", dir: "asc" }).map((r) => r.id);
    expect(ids).toEqual(["c", "b", "a"]);
  });

  it("reverses on desc", () => {
    const rows = [
      row({ id: "a", departureAt: "2026-05-01T00:00:00Z" }),
      row({ id: "b", departureAt: "2026-05-05T00:00:00Z" }),
    ];
    const ids = sort(rows, { key: "departureAt", dir: "desc" }).map((r) => r.id);
    expect(ids).toEqual(["b", "a"]);
  });

  it("sorts by arrival", () => {
    const rows = [
      row({ id: "a", arrivalAt: "2026-05-10T00:00:00Z" }),
      row({ id: "b", arrivalAt: "2026-05-05T00:00:00Z" }),
    ];
    const ids = sort(rows, { key: "arrivalAt", dir: "asc" }).map((r) => r.id);
    expect(ids).toEqual(["b", "a"]);
  });

  it("sorts by customer name alphabetically", () => {
    const rows = [
      row({ id: "a", customerName: "Zed" }),
      row({ id: "b", customerName: "Acme" }),
      row({ id: "c", customerName: "Morgan" }),
    ];
    const ids = sort(rows, { key: "customerName", dir: "asc" }).map((r) => r.id);
    expect(ids).toEqual(["b", "c", "a"]);
  });

  it("orders statuses by pipeline (pending → cancelled)", () => {
    const rows = [
      row({ id: "a", status: "cancelled" }),
      row({ id: "b", status: "pending" }),
      row({ id: "c", status: "in_transit" }),
      row({ id: "d", status: "confirmed" }),
      row({ id: "e", status: "delivered" }),
    ];
    const ids = sort(rows, { key: "status", dir: "asc" }).map((r) => r.id);
    expect(ids).toEqual(["b", "d", "c", "e", "a"]);
  });

  it("invalid dates sort last (not at the beginning)", () => {
    const rows = [
      row({ id: "bad", departureAt: "not-a-date" }),
      row({ id: "good", departureAt: "2026-05-01T00:00:00Z" }),
    ];
    const ids = sort(rows, { key: "departureAt", dir: "asc" }).map((r) => r.id);
    expect(ids).toEqual(["good", "bad"]);
  });
});

describe("defaultBookingSortDir", () => {
  it("returns asc for every key", () => {
    for (const k of [
      "departureAt",
      "arrivalAt",
      "customerName",
      "status",
    ] satisfies BookingSortKey[]) {
      expect(defaultBookingSortDir(k)).toBe("asc");
    }
  });
});
