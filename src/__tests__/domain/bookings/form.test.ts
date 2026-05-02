import {
  BookingFormModel,
  EMPTY_FORM_VALUES,
  type BookingFormValues,
} from "@/domain/bookings/form";
import type { Booking } from "@/domain/bookings/types";

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "bkg_01",
    customerId: "cus_01",
    vesselId: "ves_01",
    origin: "A",
    destination: "B",
    cargoType: "general",
    weightKg: 100,
    status: "pending",
    departureAt: "2026-05-01T08:00:00.000Z",
    arrivalAt: "2026-05-02T08:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("BookingFormModel.empty", () => {
  it("has blank defaults", () => {
    const model = BookingFormModel.empty();
    expect(model.defaults).toEqual(EMPTY_FORM_VALUES);
  });
});

describe("BookingFormModel.fromBooking", () => {
  it("seeds defaults from an existing booking", () => {
    const model = BookingFormModel.fromBooking(booking());
    expect(model.defaults.customerId).toBe("cus_01");
    expect(model.defaults.vesselId).toBe("ves_01");
    expect(model.defaults.weightKg).toBe("100");
    expect(model.defaults.status).toBe("pending");
    // `datetime-local` strings don't include seconds or a timezone.
    expect(model.defaults.departureAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(model.defaults.arrivalAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe("BookingFormModel#equals", () => {
  it("returns true for unchanged values", () => {
    const model = BookingFormModel.fromBooking(booking());
    expect(model.equals(model.defaults)).toBe(true);
  });

  it("returns false when a single field changes", () => {
    const model = BookingFormModel.fromBooking(booking());
    const changed: BookingFormValues = {
      ...model.defaults,
      origin: "Changed",
    };
    expect(model.equals(changed)).toBe(false);
  });
});

describe("BookingFormModel#buildSubmission create", () => {
  const valid = {
    ...EMPTY_FORM_VALUES,
    customerId: "cus_01",
    vesselId: "ves_01",
    origin: "A",
    destination: "B",
    cargoType: "general",
    weightKg: "100",
    status: "pending" as const,
    departureAt: "2026-05-01T08:00",
    arrivalAt: "2026-05-02T08:00",
  };

  it("returns a valid submission when all fields are filled", () => {
    const model = BookingFormModel.empty();
    const result = model.buildSubmission("create", valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.submission.mode).toBe("create");
      expect(result.submission.payload.weightKg).toBe(100);
      // datetime-local was promoted to ISO-8601 UTC.
      expect(result.submission.payload.departureAt).toMatch(/Z$/);
    }
  });

  it("returns field errors when inputs are missing", () => {
    const model = BookingFormModel.empty();
    const result = model.buildSubmission("create", EMPTY_FORM_VALUES);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.customerId).toBeTruthy();
      expect(result.errors.vesselId).toBeTruthy();
    }
  });
});

describe("BookingFormModel#buildSubmission edit", () => {
  it("sends only the fields that changed", () => {
    const model = BookingFormModel.fromBooking(booking());
    const next: BookingFormValues = {
      ...model.defaults,
      origin: "Rotterdam",
    };
    const result = model.buildSubmission("edit", next);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.submission.mode).toBe("edit");
      expect(result.submission.payload).toEqual({ origin: "Rotterdam" });
    }
  });

  it("returns an empty patch when nothing changed", () => {
    const model = BookingFormModel.fromBooking(booking());
    const result = model.buildSubmission("edit", { ...model.defaults });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.submission.mode).toBe("edit");
      expect(result.submission.payload).toEqual({});
    }
  });

  it("converts weight string to number in the patch", () => {
    const model = BookingFormModel.fromBooking(booking({ weightKg: 100 }));
    const result = model.buildSubmission("edit", {
      ...model.defaults,
      weightKg: "500",
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.submission.mode === "edit") {
      expect(result.submission.payload.weightKg).toBe(500);
    }
  });

  it("promotes local datetime to ISO in the patch", () => {
    const model = BookingFormModel.fromBooking(booking());
    const result = model.buildSubmission("edit", {
      ...model.defaults,
      departureAt: "2030-01-01T10:00",
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.submission.mode === "edit") {
      expect(result.submission.payload.departureAt).toMatch(
        /^2030-01-01T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    }
  });
});
