import { useCallback, useState } from "react";
import type { Booking, Customer, Vessel } from "@/lib/api/types";
import { api } from "@/lib/api/client";
import { Drawer } from "@/components/ui/Drawer";
import { BookingForm, type Submission } from "./BookingForm";
import { useToast } from "@/components/ui/Toast";

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
  /** Pre-fill for edit; undefined for create. */
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
          ? await api.createBooking(submission.payload)
          : await api.patchBooking(booking!.id, submission.payload);

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

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <dialog
      open
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[10000] m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="p-5">
        <h3
          id="confirm-title"
          className="text-base font-semibold text-slate-900"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm outline-none hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
