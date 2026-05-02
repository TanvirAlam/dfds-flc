/**
 * Client-side Zod schemas for booking inputs.
 *
 * Intentionally duplicated from the server (`src/server/api/bookings.ts`)
 * rather than imported, for two reasons:
 *
 *   1. The server schemas pull in Drizzle + OpenAPI decorators via their
 *      module graph; those have no place in the client bundle.
 *   2. The server is the final authority — 400 responses surface its view
 *      of the world. The client schema is a *pre-flight check* that gets
 *      obvious problems out of the way before we hit the network, not a
 *      second source of truth.
 *
 * If the server schema drifts, the type mismatch at the call site
 * (`BookingsApi.create` / `BookingsApi.patch`) will surface it.
 */

import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
  "cancelled",
]);

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

export const patchBookingSchema = createBookingSchema.partial();
export type PatchBookingInput = z.infer<typeof patchBookingSchema>;

/**
 * Turn a ZodError into a flat `fieldName → message` map the form can
 * render next to inputs. Path-less issues land under `_root`.
 */
export function zodErrorToFieldMap(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
