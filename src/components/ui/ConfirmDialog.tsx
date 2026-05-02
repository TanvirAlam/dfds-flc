/**
 * Small native-`<dialog>` confirm modal.
 *
 * Extracted from `BookingDrawer` so any flow needing a destructive
 * confirm ("Discard changes?", "Delete booking?", …) can reuse the
 * exact same layout. No styling knob for confirm-variant here — if a
 * non-destructive confirm comes up, add a `variant` prop.
 */
export function ConfirmDialog({
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
