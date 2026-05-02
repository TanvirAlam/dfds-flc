import { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking } from "@/domain/bookings/types";
import {
  BookingFormModel,
  EMPTY_FORM_VALUES,
  type BookingFormValues,
  type FormMode,
  type Submission,
} from "@/domain/bookings/form";
import { ApiError } from "@/services/api";
import { reportError, toUserFacingMessage } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";

/**
 * Form state machine for the booking create/edit flow.
 *
 * SRP: this hook owns *form state transitions only*. It delegates:
 *   - value↔API translation + validation to `BookingFormModel`,
 *   - error presentation to the errors module,
 *   - side effects to the caller via `onSubmit`.
 *
 * Returns everything the view needs to render and interact; no rendering
 * happens here. That makes it straightforward to test with
 * `renderHook` without pulling in jsdom.
 */

interface UseBookingFormArgs {
  mode: FormMode;
  initial?: Booking;
  onSubmit: (submission: Submission) => Promise<Booking>;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface UseBookingFormResult {
  values: BookingFormValues;
  errors: Record<string, string>;
  submitting: boolean;
  dirty: boolean;
  setField: <K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) => void;
  submit: () => Promise<void>;
}

export function useBookingForm({
  mode,
  initial,
  onSubmit,
  onDirtyChange,
}: UseBookingFormArgs): UseBookingFormResult {
  const { toast } = useToast();

  // `model` is recreated only when `initial` changes. Defaults are
  // derived from it, not duplicated.
  const model = useMemo(
    () => (initial ? BookingFormModel.fromBooking(initial) : BookingFormModel.empty()),
    [initial],
  );

  const [values, setValues] = useState<BookingFormValues>(() => ({
    ...model.defaults,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Re-sync when the parent switches which booking is being edited without
  // unmounting the form.
  useEffect(() => {
    setValues({ ...model.defaults });
    setErrors({});
  }, [model]);

  const dirty = useMemo(() => !model.equals(values), [model, values]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const setField = useCallback<UseBookingFormResult["setField"]>(
    (key, value) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key as string]) return prev;
        const { [key as string]: _drop, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  const submit = useCallback(async () => {
    if (submitting) return;

    const built = model.buildSubmission(mode, values);
    if (!built.ok) {
      setErrors(built.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(built.submission);
    } catch (err) {
      reportError(`BookingForm.${mode}`, err);

      // 400 with field issues → inline on the offending fields.
      // Everything else → toast; raw error messages never hit the DOM.
      const fieldErrors =
        err instanceof ApiError ? err.fieldErrors() : null;
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        const ui = toUserFacingMessage(err);
        toast({ variant: "error", title: ui.title, body: ui.body });
      }
    } finally {
      setSubmitting(false);
    }
  }, [mode, model, onSubmit, submitting, toast, values]);

  // Wrap the returned object in a stable identity when nothing changed.
  // (React compares by value for arrays but the consumer destructures —
  // this is fine as-is.)
  return { values, errors, submitting, dirty, setField, submit };
}

/** Re-export for convenience — callers usually want both. */
export { EMPTY_FORM_VALUES };
