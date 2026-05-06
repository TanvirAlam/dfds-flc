import type { BookingFormValues } from "@/domain/bookings/form";
import {
  ALL_BOOKING_STATUSES,
  statusLabel,
} from "@/domain/bookings/status";
import type { Customer, Vessel } from "@/domain/bookings/types";
import { TextInput } from "@dfds-ui/navaigator";
import { Select, SelectField, SelectTrigger, SelectContent, SelectItem } from "@dfds-ui/navaigator";
import { Section } from "./Section";
import { DateTimeInput } from "./DateTimeInput";
import { NumberInput } from "./NumberInput";

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
  return (
    <Section title="Identity" describedBy="Who the booking is for.">
      <SelectField
        label="Customer"
        status={errors.customerId ? "error" : undefined}
        errorMessage={errors.customerId}
        required
      >
        <Select
          value={values.customerId || "__placeholder__"}
          onValueChange={(val) => setField("customerId", val === "__placeholder__" ? "" : val)}
        >
          <SelectTrigger placeholder="Select a customer…" />
          <SelectContent>
            <SelectItem value="__placeholder__" disabled>
              Select a customer…
            </SelectItem>
            {sortedByName(customers).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectField>

      <SelectField
        label="Vessel"
        status={errors.vesselId ? "error" : undefined}
        errorMessage={errors.vesselId}
        required
      >
        <Select
          value={values.vesselId || "__placeholder__"}
          onValueChange={(val) => setField("vesselId", val === "__placeholder__" ? "" : val)}
        >
          <SelectTrigger placeholder="Select a vessel…" />
          <SelectContent>
            <SelectItem value="__placeholder__" disabled>
              Select a vessel…
            </SelectItem>
            {sortedByName(vessels).map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectField>
    </Section>
  );
}

export function LogisticsSection({ values, errors, setField }: FieldControls) {
  return (
    <Section title="Logistics" describedBy="Where and when the cargo travels.">
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Origin"
          value={values.origin}
          onChange={(e: any) => setField("origin", e.target.value)}
          status={errors.origin ? "error" : undefined}
          errorMessage={errors.origin}
          required
          autoComplete="off"
        />
        <TextInput
          label="Destination"
          value={values.destination}
          onChange={(e: any) => setField("destination", e.target.value)}
          status={errors.destination ? "error" : undefined}
          errorMessage={errors.destination}
          required
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateTimeInput
          label="Departure"
          value={values.departureAt}
          onChange={(e: any) => setField("departureAt", e.target.value)}
          status={errors.departureAt ? "error" : undefined}
          errorMessage={errors.departureAt}
          assistiveText="Local time."
          required
        />
        <DateTimeInput
          label="Arrival"
          value={values.arrivalAt}
          onChange={(e: any) => setField("arrivalAt", e.target.value)}
          status={errors.arrivalAt ? "error" : undefined}
          errorMessage={errors.arrivalAt}
          assistiveText="Local time."
          required
        />
      </div>

      <SelectField
        label="Status"
        status={errors.status ? "error" : undefined}
        errorMessage={errors.status}
        assistiveText="Defaults to Pending for new bookings."
      >
        <Select
          value={values.status || "__placeholder__"}
          onValueChange={(val: string) => setField("status", val === "__placeholder__" ? "pending" : val as BookingFormValues["status"])}
        >
          <SelectTrigger placeholder="Select status…" />
          <SelectContent>
            <SelectItem value="__placeholder__" disabled>
              Select status…
            </SelectItem>
            {ALL_BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectField>
    </Section>
  );
}

export function CargoSection({ values, errors, setField }: FieldControls) {
  return (
    <Section title="Cargo" describedBy="What's being shipped.">
      <div className="grid grid-cols-[1fr_9rem] gap-3">
        <TextInput
          label="Cargo type"
          value={values.cargoType}
          onChange={(e: any) => setField("cargoType", e.target.value)}
          status={errors.cargoType ? "error" : undefined}
          errorMessage={errors.cargoType}
          assistiveText="Pick a suggestion or enter a free-form description."
          required
          autoComplete="off"
          list="cargoType-suggestions"
        />
        <datalist id="cargoType-suggestions">
          <option value="general" />
          <option value="automotive" />
          <option value="refrigerated" />
          <option value="hazardous" />
        </datalist>
        <NumberInput
          label="Weight"
          value={values.weightKg}
          onChange={(e: any) => setField("weightKg", e.target.value)}
          status={errors.weightKg ? "error" : undefined}
          errorMessage={errors.weightKg}
          assistiveText="Whole kilograms."
          required
          min={1}
          step={1}
          inputMode="numeric"
        />
      </div>
    </Section>
  );
}

function sortedByName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}