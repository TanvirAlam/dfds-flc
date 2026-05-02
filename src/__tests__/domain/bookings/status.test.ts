import {
  ALL_BOOKING_STATUSES,
  statusLabel,
  statusPresenter,
} from "@/domain/bookings/status";

describe("statusPresenter", () => {
  it("provides a label, token and order for every status", () => {
    for (const s of ALL_BOOKING_STATUSES) {
      const info = statusPresenter(s);
      expect(info.label).toBeTruthy();
      expect(info.token).toBeTruthy();
      expect(info.order).toBeGreaterThanOrEqual(0);
    }
  });

  it("assigns unique pipeline orders (lifecycle order)", () => {
    const orders = ALL_BOOKING_STATUSES.map((s) => statusPresenter(s).order);
    expect(new Set(orders).size).toBe(ALL_BOOKING_STATUSES.length);
  });

  it("orders statuses through the lifecycle: pending → cancelled", () => {
    expect(statusPresenter("pending").order).toBeLessThan(
      statusPresenter("confirmed").order,
    );
    expect(statusPresenter("confirmed").order).toBeLessThan(
      statusPresenter("in_transit").order,
    );
    expect(statusPresenter("in_transit").order).toBeLessThan(
      statusPresenter("delivered").order,
    );
    expect(statusPresenter("delivered").order).toBeLessThan(
      statusPresenter("cancelled").order,
    );
  });

  it("uses kebab-case tokens for multi-word statuses", () => {
    expect(statusPresenter("in_transit").token).toBe("in-transit");
  });
});

describe("statusLabel", () => {
  it("is a shortcut for statusPresenter(s).label", () => {
    expect(statusLabel("in_transit")).toBe("In transit");
    expect(statusLabel("pending")).toBe("Pending");
  });
});
