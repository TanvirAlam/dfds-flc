import { memo } from "react";
import { statusPresenter } from "@/domain/bookings/status";
import type { BookingStatus } from "@/domain/bookings/types";
import {
  CheckIcon,
  ClockIcon,
  PackageCheckIcon,
  TruckIcon,
  XCircleIcon,
  type IconComponent,
} from "@/components/ui/StatusIcons";

/**
 * Status pill.
 *
 * - Label + icon + colour → never colour-alone; shape-differentiated for
 *   colour-blind users; text always readable by AT.
 * - Styles come from design tokens (`var(--status-*-{bg,fg,ring})`)
 *   defined in `src/styles.css`. One place to retheme.
 * - Labels + token names + sort order come from `statusPresenter` in
 *   `@/domain/bookings/status`, the single source of truth.
 *
 * Icons are mapped locally because they're a purely visual concern;
 * swapping icon sets shouldn't touch the domain layer.
 */

const ICONS: Record<BookingStatus, IconComponent> = {
  pending: ClockIcon,
  confirmed: CheckIcon,
  in_transit: TruckIcon,
  delivered: PackageCheckIcon,
  cancelled: XCircleIcon,
};

export const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const { label, token } = statusPresenter(status);
  const Icon = ICONS[status];

  const style = {
    backgroundColor: `var(--status-${token}-bg)`,
    color: `var(--status-${token}-fg)`,
    ["--tw-ring-color" as string]: `var(--status-${token}-ring)`,
  } as React.CSSProperties;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
      style={style}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
});
