import { useCallback, useState } from "react";
import type { Booking, Customer, Vessel } from "@/domain/bookings/types";
import { bookingsApi } from "@/services/api";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { BookingForm, type Submission } from "./BookingForm";

/**
 * Drawer container for the create / edit flow.
 *
 * Responsibilities:
 *   - wrap the form in a right-side `<Drawer>`,
 *   - call the appropriate API method on submit,
 *   - push a success toast + surface the persisted record upward,
 *   - gate dismiss with a "discard unsaved changes?" confirm when dirty.
 *
 * Everything else (form state, validation, diff) lives inside
 * `<BookingForm>` / `useBookingForm` / `BookingFormModel`.
 */
export function BookingDrawer({
  open,
  mode,
  booking,
  customers,
  vessels,
  onDismiss,
  onPersisted,
}: {
  open: boolean;
  mode: "create" | "edit";
  booking?: Booking;
  customers: Customer[];
  vessels: Vessel[];
  onDismiss: () => void;
  onPersisted: (booking: Booking) => void;
}) {
  const { toast } = useToast();
  const [confirmClose, setConfirmClose] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = useCallback(
    async (submission: Submission) => {
      const persisted =
        submission.mode === "create"
          ? await bookingsApi.create(submission.payload)
          : await bookingsApi.patch(booking!.id, submission.payload);

      onPersisted(persisted);
      toast({
        variant: "success",
        title:
          submission.mode === "create" ? "Booking created" : "Booking updated",
        body: persisted.id,
      });

      setDirty(false);
      setFormKey((k) => k + 1);
      onDismiss();
      return persisted;
    },
    [booking, onDismiss, onPersisted, toast],
  );

  const handleDismissAttempt = useCallback(() => {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    onDismiss();
  }, [dirty, onDismiss]);

  const forceClose = useCallback(() => {
    setConfirmClose(false);
    setDirty(false);
    setFormKey((k) => k + 1);
    onDismiss();
  }, [onDismiss]);

  return (
    <>
      <Drawer
        open={open}
        onDismiss={handleDismissAttempt}
        title={
          mode === "create"
            ? "New booking"
            : `Edit booking ${booking?.id ?? ""}`
        }
      >
        <BookingForm
          key={formKey}
          mode={mode}
          initial={mode === "edit" ? booking : undefined}
          customers={customers}
          vessels={vessels}
          onSubmit={handleSubmit}
          onCancel={handleDismissAttempt}
          onDirtyChange={setDirty}
        />
      </Drawer>

      {confirmClose ? (
        <ConfirmDialog
          title="Discard unsaved changes?"
          body="Closing will lose what you've entered. This cannot be undone."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          onCancel={() => setConfirmClose(false)}
          onConfirm={forceClose}
        />
      ) : null}
    </>
  );
}
