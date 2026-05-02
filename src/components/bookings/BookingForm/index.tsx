import { type FormEvent, useMemo } from "react";
import type { Booking, Customer, Vessel } from "@/domain/bookings/types";
import type { FormMode, Submission } from "@/domain/bookings/form";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useBookingForm } from "./useBookingForm";
import {
  CargoSection,
  IdentitySection,
  LogisticsSection,
} from "./sections";

/**
 * Booking create / edit form.
 *
 * Render-only orchestrator. Business logic (validation, coercion, diff)
 * lives in `BookingFormModel` under `@/domain/bookings/form`. State
 * machine (values, errors, submit lifecycle, dirty reporting) lives in
 * `useBookingForm`. This file wires them together, renders three
 * visual sections, and owns the submit buttons.
 */

export interface BookingFormProps {
  mode: FormMode;
  initial?: Booking;
  customers: Customer[];
  vessels: Vessel[];
  onSubmit: (submission: Submission) => Promise<Booking>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function BookingForm({
  mode,
  initial,
  customers,
  vessels,
  onSubmit,
  onCancel,
  onDirtyChange,
}: BookingFormProps) {
  const { values, errors, submitting, dirty, setField, submit } =
    useBookingForm({ mode, initial, onSubmit, onDirtyChange });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submit();
  }

  const sectionErrorSummary = useMemo(
    () => summariseErrors(errors),
    [errors],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <IdentitySection
        values={values}
        errors={errors}
        setField={setField}
        customers={customers}
        vessels={vessels}
      />
      <LogisticsSection values={values} errors={errors} setField={setField} />
      <CargoSection values={values} errors={errors} setField={setField} />

      {errors._root ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
        >
          {errors._root}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {sectionErrorSummary}
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

/** Non-visible announcement for AT users: which sections contain errors. */
function summariseErrors(errors: Record<string, string>): string {
  const parts: string[] = [];
  if (errors.customerId || errors.vesselId) parts.push("Identity has errors");
  if (
    errors.origin ||
    errors.destination ||
    errors.departureAt ||
    errors.arrivalAt ||
    errors.status
  )
    parts.push("Logistics has errors");
  if (errors.cargoType || errors.weightKg) parts.push("Cargo has errors");
  return parts.join(". ");
}

// Re-export the Submission type for drawer wiring.
export type { Submission } from "@/domain/bookings/form";
