/**
 * Client-side Zod schemas for booking inputs.
 *
 * These intentionally mirror the server schemas in `src/server/api/bookings.ts`
 * (`NewBookingInput`, `BookingPatch`). They are duplicated here, rather than
 * imported, for two reasons:
 *
 *   1. The server schemas pull in Drizzle / OpenAPI decorators via their
 *      module graph; we don't want any of that in the client bundle.
 *   2. The server is the final authority — 400 responses surface its view
 *      of the world. The client schema is a *pre-flight check* that gets
 *      wrong input out of the way before we hit the network, not a second
 *      source of truth.
 *
 * If the server schema changes, a TypeScript type mismatch at the call
 * site (`api.createBooking` / `api.patchBooking`) will surface it. Keep
 * these in sync.
 */

import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
]);

/**
 * Schema for the create flow. Matches `NewBookingInput` on the server.
 *
 * `weightKg` is parsed from string input with `z.coerce.number()` so the
 * form can keep a string in state and we get a clean validation error
 * for "abc".
 *
 * Datetimes are validated as ISO-8601 strings — the `<input type="datetime-local">`
 * value is reformatted to ISO before submit (see `BookingForm`).
 */
export const createBookingSchema = z.object({
  customerId: z.string().min(1, "Pick a customer"),
  vesselId: z.string().min(1, "Pick a vessel"),
  origin: z.string().trim().min(1, "Required"),
  destination: z.string().trim().min(1, "Required"),
  cargoType: z.string().trim().min(1, "Required"),
  weightKg: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .positive("Must be greater than zero"),
  status: bookingStatusSchema.default("pending"),
  departureAt: z
    .string()
    .min(1, "Required")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date"),
  arrivalAt: z
    .string()
    .min(1, "Required")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Edit accepts the same fields, all optional — mirrors `BookingPatch`. */
export const patchBookingSchema = createBookingSchema.partial();
export type PatchBookingInput = z.infer<typeof patchBookingSchema>;

/**
 * Turn a ZodError (or an API 400 body we've parsed) into a flat field-name
 * → message map the form can render next to inputs.
 *
 * Nested paths aren't used in these schemas, so `issue.path.join(".")` is
 * enough — if we ever add nested objects, the form will render the path
 * but a flat lookup will still work for top-level fields.
 */
export function zodErrorToFieldMap(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
