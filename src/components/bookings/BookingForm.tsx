import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { z } from "zod";
import type { Booking, Customer, Vessel } from "@/lib/api/types";
import {
  createBookingSchema,
  patchBookingSchema,
  type CreateBookingInput,
  type PatchBookingInput,
  zodErrorToFieldMap,
} from "@/lib/api/schemas";
import {
  DateTimeInput,
  Field,
  NumberInput,
  SelectInput,
  TextInput,
} from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ALL_BOOKING_STATUSES } from "@/lib/filters/bookings";
import { ApiError } from "@/lib/api/client";
import { reportError, toUserFacingMessage } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";

type Mode = "create" | "edit";

export interface BookingFormValues {
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: string;
  status: Booking["status"];
  departureAt: string;
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

export interface BookingFormProps {
  mode: Mode;
  initial?: Booking;
  customers: Customer[];
  vessels: Vessel[];
  onSubmit: (submission: Submission) => Promise<Booking>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export type Submission =
  | { mode: "create"; payload: CreateBookingInput }
  | { mode: "edit"; payload: PatchBookingInput };

export function BookingForm({
  mode,
  initial,
  customers,
  vessels,
  onSubmit,
  onCancel,
  onDirtyChange,
}: BookingFormProps) {
  const formId = useId();
  const { toast } = useToast();

  const defaults = useMemo<BookingFormValues>(
    () => (initial ? toFormValues(initial) : EMPTY_VALUES),
    [initial],
  );

  const [values, setValues] = useState<BookingFormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(defaults);
    setErrors({});
  }, [defaults]);

  const dirty = useMemo(
    () => !valuesEqual(values, defaults),
    [values, defaults],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const setField = useCallback(
    <K extends keyof BookingFormValues>(
      key: K,
      value: BookingFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
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
    if (submitting) return;

    const built = buildSubmission(mode, defaults, values);
    if (!built.ok) {
      setErrors(built.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(built.submission);
    } catch (err) {
      // Always log — we never want a caught error to vanish silently.
      reportError(`BookingForm.${mode}`, err);

      // 400 with field issues → surface inline on the offending fields.
      // Everything else (network / 5xx / surprises) → a toast with a
      // friendly message. Raw `err.message` never reaches the DOM.
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        const ui = toUserFacingMessage(err);
        toast({ variant: "error", title: ui.title, body: ui.body });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const hasIdentityError = errors.customerId || errors.vesselId;
  const hasLogisticsError =
    errors.origin ||
    errors.destination ||
    errors.departureAt ||
    errors.arrivalAt ||
    errors.status;
  const hasCargoError = errors.cargoType || errors.weightKg;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      <Section title="Identity" describedBy="Who the booking is for.">
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
            aria-invalid={Boolean(errors.customerId)}
            required
          >
            <option value="">Select a customer…</option>
            {sortedByName(customers).map((c) => (
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
            aria-invalid={Boolean(errors.vesselId)}
            required
          >
            <option value="">Select a vessel…</option>
            {sortedByName(vessels).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </SelectInput>
        </Field>
      </Section>

      <Section
        title="Logistics"
        describedBy="Where and when the cargo travels."
      >
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
              aria-invalid={Boolean(errors.origin)}
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
              aria-invalid={Boolean(errors.destination)}
              autoComplete="off"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Departure"
            htmlFor={`${formId}-departureAt`}
            error={errors.departureAt}
            hint="Local time."
            required
          >
            <DateTimeInput
              id={`${formId}-departureAt`}
              value={values.departureAt}
              onChange={(e) => setField("departureAt", e.target.value)}
              aria-invalid={Boolean(errors.departureAt)}
            />
          </Field>
          <Field
            label="Arrival"
            htmlFor={`${formId}-arrivalAt`}
            error={errors.arrivalAt}
            hint="Local time."
            required
          >
            <DateTimeInput
              id={`${formId}-arrivalAt`}
              value={values.arrivalAt}
              onChange={(e) => setField("arrivalAt", e.target.value)}
              aria-invalid={Boolean(errors.arrivalAt)}
            />
          </Field>
        </div>

        <Field
          label="Status"
          htmlFor={`${formId}-status`}
          error={errors.status}
          hint="Defaults to Pending for new bookings."
          optional
        >
          <SelectInput
            id={`${formId}-status`}
            value={values.status}
            onChange={(e) =>
              setField("status", e.target.value as Booking["status"])
            }
            aria-invalid={Boolean(errors.status)}
          >
            {ALL_BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelForStatus(s)}
              </option>
            ))}
          </SelectInput>
        </Field>
      </Section>

      <Section title="Cargo" describedBy="What's being shipped.">
        <div className="grid grid-cols-[1fr_9rem] gap-3">
          <Field
            label="Cargo type"
            htmlFor={`${formId}-cargoType`}
            error={errors.cargoType}
            hint="Pick a suggestion or enter a free-form description."
            required
          >
            <TextInput
              id={`${formId}-cargoType`}
              value={values.cargoType}
              onChange={(e) => setField("cargoType", e.target.value)}
              aria-invalid={Boolean(errors.cargoType)}
              autoComplete="off"
              list={`${formId}-cargoType-suggestions`}
            />
            <datalist id={`${formId}-cargoType-suggestions`}>
              <option value="general" />
              <option value="automotive" />
              <option value="refrigerated" />
              <option value="hazardous" />
            </datalist>
          </Field>
          <Field
            label="Weight"
            htmlFor={`${formId}-weightKg`}
            error={errors.weightKg}
            hint="Whole kilograms."
            required
          >
            <NumberInput
              id={`${formId}-weightKg`}
              value={values.weightKg}
              onChange={(e) => setField("weightKg", e.target.value)}
              aria-invalid={Boolean(errors.weightKg)}
              min={1}
              step={1}
              inputMode="numeric"
            />
          </Field>
        </div>
      </Section>

      {/*
        `_root` only shows up for client-side Zod issues that aren't
        attached to a specific field (cross-field refinements, form-shape
        problems). Server-side non-field errors are surfaced as toasts in
        `handleSubmit` — raw `err.message` never reaches the DOM.
      */}
      {errors._root ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {errors._root}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {[
          hasIdentityError && "Identity has errors",
          hasLogisticsError && "Logistics has errors",
          hasCargoError && "Cargo has errors",
        ]
          .filter(Boolean)
          .join(". ")}
      </p>

      <div className="mt-2 flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || (mode === "edit" && !dirty)}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size={14} />
              Saving…
            </span>
          ) : mode === "create" ? (
            "Create booking"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  describedBy,
  children,
}: {
  title: string;
  describedBy: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{describedBy}</p>
      </div>
      {children}
    </section>
  );
}

type BuildResult =
  | { ok: true; submission: Submission }
  | { ok: false; errors: Record<string, string> };

function buildSubmission(
  mode: Mode,
  defaults: BookingFormValues,
  values: BookingFormValues,
): BuildResult {
  const coerced = coerceForSchema(values);

  if (mode === "create") {
    const parsed = createBookingSchema.safeParse(coerced);
    if (!parsed.success) {
      return { ok: false, errors: zodErrorToFieldMap(parsed.error) };
    }
    return { ok: true, submission: { mode: "create", payload: parsed.data } };
  }

  const diff = diffFormValues(defaults, values);
  const parsed = patchBookingSchema.safeParse(diff);
  if (!parsed.success) {
    return { ok: false, errors: zodErrorToFieldMap(parsed.error) };
  }
  return { ok: true, submission: { mode: "edit", payload: parsed.data } };
}

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

function coerceForSchema(v: BookingFormValues) {
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

function diffFormValues(
  base: BookingFormValues,
  next: BookingFormValues,
): Partial<CreateBookingInput> {
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

function valuesEqual(a: BookingFormValues, b: BookingFormValues): boolean {
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
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(local: string): string {
  return new Date(local).toISOString();
}

function labelForStatus(s: Booking["status"]): string {
  switch (s) {
    case "in_transit":
      return "In transit";
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

function sortedByName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}

function extractFieldErrors(err: unknown): Record<string, string> | null {
  if (!(err instanceof ApiError)) return null;
  if (err.status !== 400) return null;

  const body = err.body as { error?: string } | null;
  const raw = body?.error;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const issues = parsed
      .filter(
        (i): i is { path?: unknown[]; message?: string } =>
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
