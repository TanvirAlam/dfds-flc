import { Drawer as NavaigatorDrawer } from "@dfds-ui/navaigator";

export function Drawer({
  open,
  onDismiss,
  title,
  children,
  footer,
  labelledBy = "drawer-title",
}: {
  open: boolean;
  onDismiss: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <NavaigatorDrawer
      open={open}
      onOpenChange={(open) => !open && onDismiss()}
      aria-labelledby={labelledBy}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2
            id={labelledBy}
            className="text-base font-semibold text-slate-900"
          >
            {title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </NavaigatorDrawer>
  );
}