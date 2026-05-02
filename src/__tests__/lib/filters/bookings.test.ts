import type { BookingRow } from "@/lib/hooks/useBookings";
import {
  EMPTY_FILTERS,
  filtersToSearch,
  isEmpty,
  matchesFilters,
  parseSearch,
  removeStatus,
  setCustomer,
  setSearch,
  setVessel,
  toggleStatus,
  type BookingFilters,
} from "@/lib/filters/bookings";

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

describe("isEmpty", () => {
  it("recognises the empty filter set", () => {
    expect(isEmpty(EMPTY_FILTERS)).toBe(true);
  });

  it("treats whitespace-only search as empty", () => {
    expect(isEmpty({ ...EMPTY_FILTERS, search: "   " })).toBe(true);
  });

  it("returns false when any facet is set", () => {
    expect(isEmpty({ ...EMPTY_FILTERS, statuses: ["pending"] })).toBe(false);
    expect(isEmpty({ ...EMPTY_FILTERS, customerId: "cus_01" })).toBe(false);
    expect(isEmpty({ ...EMPTY_FILTERS, vesselId: "ves_01" })).toBe(false);
    expect(isEmpty({ ...EMPTY_FILTERS, search: "bkg" })).toBe(false);
  });
});

describe("matchesFilters", () => {
  it("passes all rows when filters are empty", () => {
    expect(matchesFilters(row(), EMPTY_FILTERS)).toBe(true);
  });

  it("OR within the status facet", () => {
    const f: BookingFilters = { ...EMPTY_FILTERS, statuses: ["pending", "confirmed"] };
    expect(matchesFilters(row({ status: "pending" }), f)).toBe(true);
    expect(matchesFilters(row({ status: "confirmed" }), f)).toBe(true);
    expect(matchesFilters(row({ status: "delivered" }), f)).toBe(false);
  });

  it("AND across facets", () => {
    const f: BookingFilters = {
      ...EMPTY_FILTERS,
      statuses: ["pending"],
      vesselId: "ves_01",
    };
    expect(matchesFilters(row({ status: "pending", vesselId: "ves_01" }), f)).toBe(true);
    expect(matchesFilters(row({ status: "pending", vesselId: "ves_02" }), f)).toBe(false);
    expect(matchesFilters(row({ status: "confirmed", vesselId: "ves_01" }), f)).toBe(false);
  });

  it("search is case-insensitive substring on booking id", () => {
    const f: BookingFilters = { ...EMPTY_FILTERS, search: "BKG_0" };
    expect(matchesFilters(row({ id: "bkg_05" }), f)).toBe(true);
    expect(matchesFilters(row({ id: "BKG_07" }), f)).toBe(true);
    expect(matchesFilters(row({ id: "xyz" }), f)).toBe(false);
  });

  it("search trims whitespace", () => {
    const f: BookingFilters = { ...EMPTY_FILTERS, search: "   " };
    expect(matchesFilters(row(), f)).toBe(true);
  });
});

describe("parseSearch ↔ filtersToSearch", () => {
  it("round-trips a fully populated filter set", () => {
    const original: BookingFilters = {
      statuses: ["pending", "confirmed"],
      customerId: "cus_01",
      vesselId: "ves_02",
      search: "bkg",
    };
    const round = parseSearch(filtersToSearch(original));
    expect(round).toEqual(original);
  });

  it("round-trips the empty filter set", () => {
    const round = parseSearch(filtersToSearch(EMPTY_FILTERS));
    expect(round).toEqual(EMPTY_FILTERS);
  });

  it("drops unknown status values on parse", () => {
    const parsed = parseSearch({ status: "bogus,pending" });
    expect(parsed.statuses).toEqual(["pending"]);
  });

  it("filtersToSearch omits empty facets (keeps URL tidy)", () => {
    const out = filtersToSearch(EMPTY_FILTERS);
    expect(out.status).toBeUndefined();
    expect(out.customerId).toBeUndefined();
    expect(out.vesselId).toBeUndefined();
    expect(out.q).toBeUndefined();
  });

  it("parseSearch treats empty strings as null / empty", () => {
    const parsed = parseSearch({
      status: "",
      customerId: "  ",
      vesselId: "",
      q: "  ",
    });
    expect(parsed.statuses).toEqual([]);
    expect(parsed.customerId).toBeNull();
    expect(parsed.vesselId).toBeNull();
    expect(parsed.search).toBe("");
  });
});

describe("filter updaters are immutable", () => {
  it("toggleStatus adds and removes", () => {
    const a = toggleStatus(EMPTY_FILTERS, "pending");
    expect(a).not.toBe(EMPTY_FILTERS); // new reference
    expect(a.statuses).toEqual(["pending"]);
    const b = toggleStatus(a, "pending");
    expect(b.statuses).toEqual([]);
  });

  it("removeStatus is a no-op when not present", () => {
    const next = removeStatus(EMPTY_FILTERS, "pending");
    expect(next.statuses).toEqual([]);
  });

  it("setCustomer / setVessel replace values", () => {
    expect(setCustomer(EMPTY_FILTERS, "cus_01").customerId).toBe("cus_01");
    expect(setVessel(EMPTY_FILTERS, "ves_02").vesselId).toBe("ves_02");
  });

  it("setSearch writes the raw value", () => {
    expect(setSearch(EMPTY_FILTERS, "hello").search).toBe("hello");
  });
});
