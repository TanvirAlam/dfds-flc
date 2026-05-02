import { z } from "zod";
import {
  createBookingSchema,
  patchBookingSchema,
  zodErrorToFieldMap,
} from "@/lib/api/schemas";

const VALID_INPUT = {
  customerId: "cust_1",
  vesselId: "ves_1",
  origin: "Singapore",
  destination: "Rotterdam",
  cargoType: "general",
  weightKg: 5000,
  departureAt: "2024-06-01T10:00:00Z",
  arrivalAt: "2024-06-15T10:00:00Z",
};

describe("createBookingSchema", () => {
  it("accepts valid input", () => {
    const result = createBookingSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  it("defaults status to pending", () => {
    const result = createBookingSchema.parse(VALID_INPUT);
    expect(result.status).toBe("pending");
  });

  it("coerces weightKg from string", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      weightKg: "1000",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.weightKg).toBe(1000);
  });

  it("rejects non-numeric weightKg", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      weightKg: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero weightKg", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      weightKg: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty customerId", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      customerId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty origin", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      origin: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid departureAt", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      departureAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it.each(["pending", "confirmed", "in_transit", "delivered", "cancelled"])(
    "accepts status=%s",
    (status) => {
      const result = createBookingSchema.safeParse({ ...VALID_INPUT, status });
      expect(result.success).toBe(true);
    },
  );

  it("rejects an invalid status", () => {
    const result = createBookingSchema.safeParse({
      ...VALID_INPUT,
      status: "unknown_status",
    });
    expect(result.success).toBe(false);
  });
});

describe("patchBookingSchema", () => {
  it("accepts an empty object", () => {
    const result = patchBookingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial fields", () => {
    const result = patchBookingSchema.safeParse({ origin: "Hamburg" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid fields", () => {
    const result = patchBookingSchema.safeParse({ weightKg: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("zodErrorToFieldMap", () => {
  it("maps field paths to messages", () => {
    const result = createBookingSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const map = zodErrorToFieldMap(result.error);
      expect(map.customerId).toBeDefined();
      expect(map.vesselId).toBeDefined();
      expect(map.origin).toBeDefined();
    }
  });

  it("uses _root for path-less issues", () => {
    const err = new z.ZodError([
      { code: "custom", path: [], message: "Bad form" },
    ]);
    const map = zodErrorToFieldMap(err);
    expect(map._root).toBe("Bad form");
  });

  it("keeps only the first message per field", () => {
    const err = new z.ZodError([
      { code: "custom", path: ["foo"], message: "first" },
      { code: "custom", path: ["foo"], message: "second" },
    ]);
    const map = zodErrorToFieldMap(err);
    expect(map.foo).toBe("first");
  });
});
