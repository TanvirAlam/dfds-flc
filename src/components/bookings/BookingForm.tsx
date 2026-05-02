import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { Booking, Customer, Vessel } from "@/lib/api/types";
import {
  createBookingSchema,
  patchBookingSchema,
  type CreateBookingInput,
  zodErrorToFieldMap,
} from "@/lib/api/schemas";
import { Field, DateTimeInput, NumberInput, SelectInput, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ALL_BOOKING_STATUSES } from "@/lib/filters/bookings";
import { ApiError } from "@/lib/api/client";
import { z } from "zod";

/**
 * Create/edit booking form.
 *
 * Single component for both modes. Pass `initial` to edit; omit it to
 * create. The shape of the submit action differs (`POST` vs `PATCH`) so
 * we delegate it to the parent via `onSubmit`, which returns a promise
 * that resolves with the persisted booking or rejects with an error.
 *
 * Validation strategy:
 *   - The client Zod schema in `src/lib/api/schemas.ts` mirrors the
 *     server's. Local parse is best-effort — it catches obvious problems
 *     so we don't round-trip, but the server is the final authority.
 *   - Server 400 responses are surfaced per-field when they contain a
 *     Zod-style path. `src/server/api/bookings.ts` currently returns
 *     `{ error: err.message }`; the message string is parsed in
 *     `extractFieldErrorsFromServer` below. If the server starts
 *     returning `{ errors: [...] }`, this function is where to update.
 *
 * Submit handling: pessimistic. A freight booking has real-world
 * implications (capacity, departures). Showing a row optimistically and
 * then removing it on failure would be worse than a brief pending state.
 * The submit button shows a spinner while in flight.
 *
 * Anti-double-submit: the submit button is `disabled` while `submitting`,
 * and we also guard the submit handler with a ref so a double-click that
 * races the `disabled` paint is still a no-op.
 */

type Mode = "create" | "edit";

export interface BookingFormValues {
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  /** Kept as a string so the input can hold "" while the user types. */
  weightKg: string;
  status: Booking["status"];
  /** `datetime-local` format, e.g. "2026-05-10T14:30". */
  departureAt: string;
  /** Same as above. */
  arrivalAt: string;
}

const EMPTY_VALUES: BookingFormValues = {
  customerId: "",
  vesselId: "",
  origin: "",
  destination: "",
  cargoType: "",
  weightKg: "",
  status: "pending",
  departureAt: "",
  arrivalAt: "",
};

export function BookingForm({
  mode,
  initial,
  customers,
  vessels,
  onSubmit,
  onCancel,
}: {
  mode: Mode;
  /** Present when editing; absent when creating. */
  initial?: Booking;
  customers: Customer[];
  vessels: Vessel[];
  /** Returns the persisted booking on success; throws on failure. */
  onSubmit: (payload: CreateBookingInput, mode: Mode) => Promise<Booking>;
  onCancel: () => void;
}) {
  const formId = useId();

  const defaults = useMemo<BookingFormValues>(
    () => (initial ? toFormValues(initial) : EMPTY_VALUES),
    [initial],
  );

  const [values, setValues] = useState<BookingFormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  /**
   * Race-proof double-submit guard. `disabled={submitting}` on the button
   * *usually* wins, but "usually" isn't good enough for bookings.
   */
  const [lockedAt, setLockedAt] = useState<number | null>(null);

  // Re-sync local state if the parent swaps which booking is being edited
  // (e.g. opens the drawer for a different row) without unmounting the form.
  useEffect(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  const dirty = useMemo(
    () => !shallowEqualValues(values, defaults),
    [values, defaults],
  );

  const setField = useCallback(
    <K extends keyof BookingFormValues>(key: K, v: BookingFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: v }));
      setErrors((prev) => {
        if (!prev[key as string]) return prev;
        const { [key as string]: _drop, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Double-submit guard — belt and braces alongside `disabled`.
    const now = Date.now();
    if (submitting || (lockedAt && now - lockedAt < 500)) return;
    setLockedAt(now);

    // Client-side pre-flight. Create-schema is strict; edit-schema is
    // partial but we still run it for sanity — then in edit mode we only
    // send the keys that actually changed.
    const schema = mode === "create" ? createBookingSchema : patchBookingSchema;
    const coerced = coerceForSchema(values);

    const parsed = schema.safeParse(coerced);
    if (!parsed.success) {
      setErrors(zodErrorToFieldMap(parsed.error));
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload =
        mode === "create"
          ? (parsed.data as CreateBookingInput)
          : (diff(defaults, values) as CreateBookingInput);

      await onSubmit(payload, mode);
      // Parent handles closing + toasting on success.
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setErrors({
          _root:
            err instanceof Error
              ? err.message
              : "Something went wrong. Try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3"
    >
      <Field
        label="Customer"
        htmlFor={`${formId}-customerId`}
        error={errors.customerId}
        required
      >
        <SelectInput
          id={`${formId}-customerId`}
          value={values.customerId}
          onChange={(e) => setField("customerId", e.target.value)}
          aria-invalid={!!errors.customerId}
          required
        >
          <option value="">Select a customer…</option>
          {[...customers]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </SelectInput>
      </Field>

      <Field
        label="Vessel"
        htmlFor={`${formId}-vesselId`}
        error={errors.vesselId}
        required
      >
        <SelectInput
          id={`${formId}-vesselId`}
          value={values.vesselId}
          onChange={(e) => setField("vesselId", e.target.value)}
          aria-invalid={!!errors.vesselId}
          required
        >
          <option value="">Select a vessel…</option>
          {[...vessels]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
        </SelectInput>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Origin"
          htmlFor={`${formId}-origin`}
          error={errors.origin}
          required
        >
          <TextInput
            id={`${formId}-origin`}
            value={values.origin}
            onChange={(e) => setField("origin", e.target.value)}
            aria-invalid={!!errors.origin}
            autoComplete="off"
          />
        </Field>
        <Field
          label="Destination"
          htmlFor={`${formId}-destination`}
          error={errors.destination}
          required
        >
          <TextInput
            id={`${formId}-destination`}
            value={values.destination}
            onChange={(e) => setField("destination", e.target.value)}
            aria-invalid={!!errors.destination}
            autoComplete="off"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Cargo type"
          htmlFor={`${formId}-cargoType`}
          error={errors.cargoType}
          required
        >
          <TextInput
            id={`${formId}-cargoType`}
            value={values.cargoType}
            onChange={(e) => setField("cargoType", e.target.value)}
            aria-invalid={!!errors.cargoType}
            autoComplete="off"
            list={`${formId}-cargoType-suggestions`}
          />
          {/* Light hints; no validation force. */}
          <datalist id={`${formId}-cargoType-suggestions`}>
            <option value="general" />
            <option value="automotive" />
            <option value="refrigerated" />
            <option value="hazardous" />
          </datalist>
        </Field>
        <Field
          label="Weight (kg)"
          htmlFor={`${formId}-weightKg`}
          error={errors.weightKg}
          required
        >
          <NumberInput
            id={`${formId}-weightKg`}
            value={values.weightKg}
            onChange={(e) => setField("weightKg", e.target.value)}
            aria-invalid={!!errors.weightKg}
            min={1}
            step={1}
            inputMode="numeric"
          />
        </Field>
      </div>

      <Field
        label="Status"
        htmlFor={`${formId}-status`}
        error={errors.status}
      >
        <SelectInput
          id={`${formId}-status`}
          value={values.status}
          onChange={(e) =>
            setField("status", e.target.value as Booking["status"])
          }
          aria-invalid={!!errors.status}
        >
          {ALL_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelForStatus(s)}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Departure"
          htmlFor={`${formId}-departureAt`}
          error={errors.departureAt}
          required
        >
          <DateTimeInput
            id={`${formId}-departureAt`}
            value={values.departureAt}
            onChange={(e) => setField("departureAt", e.target.value)}
            aria-invalid={!!errors.departureAt}
          />
        </Field>
        <Field
          label="Arrival"
          htmlFor={`${formId}-arrivalAt`}
          error={errors.arrivalAt}
          required
        >
          <DateTimeInput
            id={`${formId}-arrivalAt`}
            value={values.arrivalAt}
            onChange={(e) => setField("arrivalAt", e.target.value)}
            aria-invalid={!!errors.arrivalAt}
          />
        </Field>
      </div>

      {errors._root ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {errors._root}
        </p>
      ) : null}

      {/* The footer lives in the Drawer so it sticks to the bottom; we
          render controls here as a fallback for form-submit wiring and
          also expose them for screens without the drawer. */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || (mode === "edit" && !dirty)}
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create booking"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Convert a `Booking` (with ISO strings) into the form's shape (with
 * `datetime-local` strings and a stringified weight).
 */
function toFormValues(b: Booking): BookingFormValues {
  return {
    customerId: b.customerId,
    vesselId: b.vesselId,
    origin: b.origin,
    destination: b.destination,
    cargoType: b.cargoType,
    weightKg: String(b.weightKg),
    status: b.status,
    departureAt: isoToLocal(b.departureAt),
    arrivalAt: isoToLocal(b.arrivalAt),
  };
}

/**
 * Coerce form values into the shape the schema expects to parse:
 *   - weightKg: string → number-ish for `z.coerce.number()`
 *   - departureAt/arrivalAt: `datetime-local` → ISO-8601 UTC
 */
function coerceForSchema(v: BookingFormValues) {
  return {
    ...v,
    weightKg: v.weightKg.trim() === "" ? undefined : v.weightKg,
    departureAt: v.departureAt ? localToIso(v.departureAt) : "",
    arrivalAt: v.arrivalAt ? localToIso(v.arrivalAt) : "",
  };
}

/**
 * Diff for the edit flow. We only send changed fields on PATCH — keeps
 * server logs meaningful and lets the server skip no-op validation.
 */
function diff(
  base: BookingFormValues,
  next: BookingFormValues,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const coerced = coerceForSchema(next);
  for (const key of Object.keys(next) as Array<keyof BookingFormValues>) {
    if (base[key] !== next[key]) {
      const value =
        key === "weightKg"
          ? Number(coerced.weightKg)
          : key === "departureAt" || key === "arrivalAt"
            ? coerced[key]
            : next[key];
      out[key] = value;
    }
  }
  return out;
}

function shallowEqualValues(
  a: BookingFormValues,
  b: BookingFormValues,
): boolean {
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

function isoToLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // `datetime-local` expects `YYYY-MM-DDTHH:mm` in *local* time.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(local: string): string {
  // `new Date("2026-05-10T14:30")` parses as local time in all evergreen
  // browsers, which is what we want: the user typed wall-clock time.
  const d = new Date(local);
  return d.toISOString();
}

function labelForStatus(s: Booking["status"]): string {
  switch (s) {
    case "in_transit":
      return "In transit";
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

/**
 * Try to tease field-level errors out of a server response. Today the
 * server wraps `z.ZodError#message` (a JSON string of issues) in
 * `{ error }`. We parse it back into an `issues`-shaped array and hand it
 * to `zodErrorToFieldMap`.
 *
 * Returns `null` if the error doesn't look field-shaped, so the caller
 * falls back to a root error message.
 */
function extractFieldErrors(err: unknown): Record<string, string> | null {
  if (!(err instanceof ApiError)) return null;
  if (err.status !== 400) return null;

  const body = err.body as { error?: string } | null;
  const raw = body?.error;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    // Hand-roll a ZodError from the shape to reuse our mapper.
    const issues = parsed
      .filter((i): i is { path?: unknown[]; message?: string } =>
        typeof i === "object" && i !== null,
      )
      .map((i) => ({
        code: "custom" as const,
        path: Array.isArray(i.path) ? (i.path as (string | number)[]) : [],
        message: typeof i.message === "string" ? i.message : "Invalid value",
      }));

    if (issues.length === 0) return null;
    return zodErrorToFieldMap(new z.ZodError(issues));
  } catch {
    return null;
  }
}
