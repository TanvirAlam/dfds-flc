import { isoToLocal, localToIso } from "@/domain/time";
import type {
  CreateBookingInput,
  PatchBookingInput,
} from "@/services/api/schemas";
import {
  createBookingSchema,
  patchBookingSchema,
  zodErrorToFieldMap,
} from "@/services/api/schemas";
import type { Booking, BookingStatus } from "./types";

/**
 * Booking form model.
 *
 * A small OO-flavoured class that owns every concern the booking form
 * has *other* than React rendering:
 *
 *   - Initial values (`fromBooking` / `empty`).
 *   - Coercion into Zod-parseable shape.
 *   - Client-side validation (create / patch schemas).
 *   - Diff (used for the PATCH payload so we only send what changed).
 *   - Value equality (drives dirty-state in the hook).
 *
 * Why a class and not a pile of functions? Because the form has state
 * that evolves against a baseline (`defaults`) in two directions —
 * "what did the user enter?" and "what changed?" — and wrapping that
 * into a type with methods keeps call-sites readable:
 *
 *   ```
 *   const model = new BookingFormModel(defaults);
 *   model.equals(next)           // dirty?
 *   model.buildSubmission(next)  // { ok, submission | errors }
 *   ```
 *
 * The class is value-oriented (immutable defaults, pure methods). No
 * React, no DOM — trivially testable.
 */

export interface BookingFormValues {
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  /** String so the input can hold "" while the user types. */
  weightKg: string;
  status: BookingStatus;
  /** `<input type="datetime-local">` wall-clock string. */
  departureAt: string;
  arrivalAt: string;
}

export const EMPTY_FORM_VALUES: Readonly<BookingFormValues> = Object.freeze({
  customerId: "",
  vesselId: "",
  origin: "",
  destination: "",
  cargoType: "",
  weightKg: "",
  status: "pending",
  departureAt: "",
  arrivalAt: "",
});

export type FormMode = "create" | "edit";

export type Submission =
  | { mode: "create"; payload: CreateBookingInput }
  | { mode: "edit"; payload: PatchBookingInput };

export type BuildResult =
  | { ok: true; submission: Submission }
  | { ok: false; errors: Record<string, string> };

export class BookingFormModel {
  readonly defaults: Readonly<BookingFormValues>;

  constructor(defaults: Readonly<BookingFormValues> = EMPTY_FORM_VALUES) {
    this.defaults = defaults;
  }

  /** Factory: model for the edit flow, pre-filled from an existing booking. */
  static fromBooking(b: Booking): BookingFormModel {
    return new BookingFormModel({
      customerId: b.customerId,
      vesselId: b.vesselId,
      origin: b.origin,
      destination: b.destination,
      cargoType: b.cargoType,
      weightKg: String(b.weightKg),
      status: b.status,
      departureAt: isoToLocal(b.departureAt),
      arrivalAt: isoToLocal(b.arrivalAt),
    });
  }

  /** Factory: model for the create flow, blank. */
  static empty(): BookingFormModel {
    return new BookingFormModel(EMPTY_FORM_VALUES);
  }

  /** True when two value snapshots are structurally equal. */
  equals(a: BookingFormValues, b: BookingFormValues = this.defaults): boolean {
    return (
      a.customerId === b.customerId &&
      a.vesselId === b.vesselId &&
      a.origin === b.origin &&
      a.destination === b.destination &&
      a.cargoType === b.cargoType &&
      a.weightKg === b.weightKg &&
      a.status === b.status &&
      a.departureAt === b.departureAt &&
      a.arrivalAt === b.arrivalAt
    );
  }

  /**
   * Turn the current values into a typed submission ready for the API.
   *
   * `create` → full `CreateBookingInput`.
   * `edit`   → `PatchBookingInput` containing only the keys that differ
   *             from `defaults`.
   *
   * Returns `{ ok: false, errors }` on validation failure; the caller
   * renders those next to fields.
   */
  buildSubmission(mode: FormMode, values: BookingFormValues): BuildResult {
    const coerced = this.coerceForCreate(values);

    if (mode === "create") {
      const parsed = createBookingSchema.safeParse(coerced);
      if (!parsed.success) {
        return { ok: false, errors: zodErrorToFieldMap(parsed.error) };
      }
      return {
        ok: true,
        submission: { mode: "create", payload: parsed.data },
      };
    }

    const diff = this.diff(values);
    const parsed = patchBookingSchema.safeParse(diff);
    if (!parsed.success) {
      return { ok: false, errors: zodErrorToFieldMap(parsed.error) };
    }
    return {
      ok: true,
      submission: { mode: "edit", payload: parsed.data },
    };
  }

  /**
   * Reshape form values into what the Zod `create` schema expects:
   *   - `weightKg`: empty string → `undefined` so "required" fires
   *     instead of "NaN".
   *   - datetimes: `datetime-local` → ISO-8601 UTC.
   */
  private coerceForCreate(v: BookingFormValues) {
    return {
      customerId: v.customerId,
      vesselId: v.vesselId,
      origin: v.origin,
      destination: v.destination,
      cargoType: v.cargoType,
      weightKg: v.weightKg.trim() === "" ? undefined : v.weightKg,
      status: v.status,
      departureAt: v.departureAt ? localToIso(v.departureAt) : "",
      arrivalAt: v.arrivalAt ? localToIso(v.arrivalAt) : "",
    };
  }

  /**
   * Return only the keys whose value has changed compared to `defaults`.
   * Dates and weight are reshaped to the server's expected types.
   */
  private diff(next: BookingFormValues): Partial<CreateBookingInput> {
    const base = this.defaults;
    const out: Partial<CreateBookingInput> = {};

    if (base.customerId !== next.customerId) out.customerId = next.customerId;
    if (base.vesselId !== next.vesselId) out.vesselId = next.vesselId;
    if (base.origin !== next.origin) out.origin = next.origin;
    if (base.destination !== next.destination) out.destination = next.destination;
    if (base.cargoType !== next.cargoType) out.cargoType = next.cargoType;
    if (base.weightKg !== next.weightKg) {
      const n = Number(next.weightKg);
      if (Number.isFinite(n)) out.weightKg = n;
    }
    if (base.status !== next.status) out.status = next.status;
    if (base.departureAt !== next.departureAt && next.departureAt) {
      out.departureAt = localToIso(next.departureAt);
    }
    if (base.arrivalAt !== next.arrivalAt && next.arrivalAt) {
      out.arrivalAt = localToIso(next.arrivalAt);
    }
    return out;
  }
}
