import { useEffect, useRef } from "react";

/**
 * Right-side drawer (sheet) used for the booking create/edit flow.
 *
 * Why a drawer and not a modal:
 *   - Ops work the list — the table behind the drawer stays visible so
 *     adjacent bookings can be eyeballed while editing.
 *   - Long forms scroll awkwardly in centred modals.
 *
 * Why not a full route page:
 *   - Switching pages loses list context (filters, sort, scroll position)
 *     even with preservation tricks. A drawer keeps that state live.
 *
 * Implementation notes:
 *   - Uses a native `<dialog>` in modal mode. That buys us focus trap,
 *     Escape-to-close, and inert-backdrop semantics from the browser —
 *     no a11y library required. Keyboard traversal stays inside the form
 *     until the user closes it.
 *   - `onDismiss` is called for Escape, backdrop click, or the close
 *     button. The parent decides whether to guard dirty state.
 *   - Animation is kept deliberately minimal (fade + slide) so the UI
 *     feels instant. `prefers-reduced-motion` users get fade only.
 */
export function Drawer({
  open,
  onDismiss,
  title,
  children,
  footer,
  labelledBy = "drawer-title",
  width = "max-w-xl",
}: {
  open: boolean;
  onDismiss: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labelledBy?: string;
  width?: string;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  // Sync React's `open` prop with the browser's modal/non-modal state.
  // `showModal()` is what gives us the focus trap and backdrop; calling
  // `show()` would not.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The `<dialog>` fires `cancel` for Escape. Route both `cancel` and
  // `close` through `onDismiss` so the parent has a single affordance to
  // react to (e.g. confirm if dirty). We `preventDefault` on `cancel` to
  // avoid double-close surprises — we'll close deliberately via `open`.
  function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    onDismiss();
  }

  // Backdrop click: `<dialog>` fires `click` on itself for the backdrop.
  // The form is inside an inner wrapper; if `e.target` is the dialog
  // element itself, the user clicked outside the panel.
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onDismiss();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      // Reset the default centred dialog positioning — we want a right-side
      // sheet, full viewport height, no max-width cap from the UA.
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-slate-900/40 open:animate-[fade_120ms_ease-out]"
    >
      <div className="pointer-events-none flex h-full w-full justify-end">
        <div
          className={`pointer-events-auto flex h-full w-full ${width} flex-col bg-white shadow-xl motion-safe:animate-[slide_160ms_ease-out]`}
          // Block the backdrop click from bubbling out to the dialog and
          // being treated as a dismiss.
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <h2
              id={labelledBy}
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>
          {footer ? (
            <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes fade {
          from { opacity: 0 } to { opacity: 1 }
        }
        @keyframes slide {
          from { transform: translateX(8px); opacity: 0 }
          to   { transform: translateX(0);   opacity: 1 }
        }
      `}</style>
    </dialog>
  );
}
