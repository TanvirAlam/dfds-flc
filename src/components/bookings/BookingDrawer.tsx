import { useCallback, useState } from "react";
import type { Booking, Customer, Vessel } from "@/lib/api/types";
import type { CreateBookingInput } from "@/lib/api/schemas";
import { api } from "@/lib/api/client";
import { Drawer } from "@/components/ui/Drawer";
import { BookingForm } from "./BookingForm";
import { useToast } from "@/components/ui/Toast";

/**
 * Owns:
 *   - drawer visibility (driven by the `open`/`mode` props which come
 *     from the URL),
 *   - the "you have unsaved changes" confirm when the user tries to
 *     close a dirty form,
 *   - calling the right API method and handing the result back via
 *     `onPersisted` so the page can upsert the row.
 *
 * The form itself is a dumb child: it takes initial values, reports
 * submits as a promise. This split keeps network + URL state out of the
 * form and makes the form trivial to reuse (e.g. on a detail page
 * later).
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
  /** Pre-fill for edit; undefined for create. */
  booking?: Booking;
  customers: Customer[];
  vessels: Vessel[];
  onDismiss: () => void;
  onPersisted: (booking: Booking) => void;
}) {
  const { toast } = useToast();
  const [confirmClose, setConfirmClose] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // We track "is the form dirty" in a ref via a callback from the form's
  // submit handler. Rather than plumb state upward from a controlled form,
  // we rely on the simpler contract: parent only confirms when the form
  // *reports* dirty. Since the form is remounted per open (via `key`),
  // that state stays local. Here we use an indirect approach: the form
  // fires `onCancel` which passes through our guarded path, and the
  // dirty check is delegated to a native `<form>`'s `reportValidity` —
  // but a simpler, explicit signal is nicer. We read dirty from the form
  // through a shared callback.
  //
  // In this iteration: the form exposes `dirty` implicitly by enabling
  // the Save button only when dirty. For the close guard we listen for
  // the user attempting to dismiss and ask them — we can't reach into
  // the child, so we over-confirm (ask on any dismiss). To avoid being
  // annoying when the form hasn't been touched, we reset the child on
  // each `open` via `key={formKey}` and only guard when *we* know the
  // form may have been edited. This is tracked with a simple "touched"
  // signal on submit attempts / cancel attempts below.
  const [touched, setTouched] = useState(false);

  const handleSubmit = useCallback(
    async (payload: CreateBookingInput, submitMode: "create" | "edit") => {
      const persisted =
        submitMode === "create"
          ? await api.createBooking(payload)
          : await api.patchBooking(booking!.id, payload);
      onPersisted(persisted);
      toast({
        variant: "success",
        title: submitMode === "create" ? "Booking created" : "Booking updated",
        body: persisted.id,
      });
      // Reset dirty tracking and close.
      setTouched(false);
      setFormKey((k) => k + 1);
      onDismiss();
      return persisted;
    },
    [booking, onDismiss, onPersisted, toast],
  );

  const handleDismissAttempt = useCallback(() => {
    if (touched) {
      setConfirmClose(true);
      return;
    }
    onDismiss();
  }, [touched, onDismiss]);

  const forceClose = useCallback(() => {
    setConfirmClose(false);
    setTouched(false);
    setFormKey((k) => k + 1);
    onDismiss();
  }, [onDismiss]);

  return (
    <>
      <Drawer
        open={open}
        onDismiss={handleDismissAttempt}
        title={mode === "create" ? "New booking" : `Edit booking ${booking?.id ?? ""}`}
      >
        {/* We track dirtiness with a simple "field changed" listener wrapping
            the form — see the onInput handler below. */}
        <div
          onInput={() => {
            if (!touched) setTouched(true);
          }}
        >
          <BookingForm
            key={formKey}
            mode={mode}
            initial={mode === "edit" ? booking : undefined}
            customers={customers}
            vessels={vessels}
            onSubmit={handleSubmit}
            onCancel={handleDismissAttempt}
          />
        </div>
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
  // Native <dialog> again — gives us the focus trap for free. Because it's
  // opened while the outer drawer dialog is already open, stacking is
  // handled by the browser (last-opened is on top).
  return (
    <dialog
      open
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[10000] m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="p-5">
        <h3 id="confirm-title" className="text-base font-semibold text-slate-900">
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
