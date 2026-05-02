import { useId } from "react";
import type { BookingFormValues } from "@/domain/bookings/form";
import {
  ALL_BOOKING_STATUSES,
  statusLabel,
} from "@/domain/bookings/status";
import type { Customer, Vessel } from "@/domain/bookings/types";
import {
  DateTimeInput,
  Field,
  NumberInput,
  SelectInput,
  TextInput,
} from "@/components/ui/Field";
import { Section } from "./Section";

/**
 * Visual sections of the booking form.
 *
 * Each section is a pure, prop-driven view. No validation, no state
 * machine. The parent passes values + errors + a setter and gets back
 * fully-wired controls.
 */

export interface FieldControls {
  values: BookingFormValues;
  errors: Record<string, string>;
  setField: <K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) => void;
}

export function IdentitySection({
  values,
  errors,
  setField,
  customers,
  vessels,
}: FieldControls & { customers: Customer[]; vessels: Vessel[] }) {
  const base = useId();
  return (
    <Section title="Identity" describedBy="Who the booking is for.">
      <Field
        label="Customer"
        htmlFor={`${base}-customerId`}
        error={errors.customerId}
        required
      >
        <SelectInput
          id={`${base}-customerId`}
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
        htmlFor={`${base}-vesselId`}
        error={errors.vesselId}
        required
      >
        <SelectInput
          id={`${base}-vesselId`}
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
  );
}

export function LogisticsSection({ values, errors, setField }: FieldControls) {
  const base = useId();
  return (
    <Section title="Logistics" describedBy="Where and when the cargo travels.">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Origin"
          htmlFor={`${base}-origin`}
          error={errors.origin}
          required
        >
          <TextInput
            id={`${base}-origin`}
            value={values.origin}
            onChange={(e) => setField("origin", e.target.value)}
            aria-invalid={Boolean(errors.origin)}
            autoComplete="off"
          />
        </Field>
        <Field
          label="Destination"
          htmlFor={`${base}-destination`}
          error={errors.destination}
          required
        >
          <TextInput
            id={`${base}-destination`}
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
          htmlFor={`${base}-departureAt`}
          error={errors.departureAt}
          hint="Local time."
          required
        >
          <DateTimeInput
            id={`${base}-departureAt`}
            value={values.departureAt}
            onChange={(e) => setField("departureAt", e.target.value)}
            aria-invalid={Boolean(errors.departureAt)}
          />
        </Field>
        <Field
          label="Arrival"
          htmlFor={`${base}-arrivalAt`}
          error={errors.arrivalAt}
          hint="Local time."
          required
        >
          <DateTimeInput
            id={`${base}-arrivalAt`}
            value={values.arrivalAt}
            onChange={(e) => setField("arrivalAt", e.target.value)}
            aria-invalid={Boolean(errors.arrivalAt)}
          />
        </Field>
      </div>

      <Field
        label="Status"
        htmlFor={`${base}-status`}
        error={errors.status}
        hint="Defaults to Pending for new bookings."
        optional
      >
        <SelectInput
          id={`${base}-status`}
          value={values.status}
          onChange={(e) =>
            setField("status", e.target.value as BookingFormValues["status"])
          }
          aria-invalid={Boolean(errors.status)}
        >
          {ALL_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </SelectInput>
      </Field>
    </Section>
  );
}

export function CargoSection({ values, errors, setField }: FieldControls) {
  const base = useId();
  return (
    <Section title="Cargo" describedBy="What's being shipped.">
      <div className="grid grid-cols-[1fr_9rem] gap-3">
        <Field
          label="Cargo type"
          htmlFor={`${base}-cargoType`}
          error={errors.cargoType}
          hint="Pick a suggestion or enter a free-form description."
          required
        >
          <TextInput
            id={`${base}-cargoType`}
            value={values.cargoType}
            onChange={(e) => setField("cargoType", e.target.value)}
            aria-invalid={Boolean(errors.cargoType)}
            autoComplete="off"
            list={`${base}-cargoType-suggestions`}
          />
          <datalist id={`${base}-cargoType-suggestions`}>
            <option value="general" />
            <option value="automotive" />
            <option value="refrigerated" />
            <option value="hazardous" />
          </datalist>
        </Field>
        <Field
          label="Weight"
          htmlFor={`${base}-weightKg`}
          error={errors.weightKg}
          hint="Whole kilograms."
          required
        >
          <NumberInput
            id={`${base}-weightKg`}
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
  );
}

function sortedByName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}
