import { memo } from "react";
import { Badge } from "@dfds-ui/navaigator";
import { statusPresenter } from "@/domain/bookings/status";
import type { BookingStatus } from "@/domain/bookings/types";

/**
 * Status pill.
 *
 * Uses NavAIgator Badge component with variant mapped from booking status.
 * - Label + icon + colour → never colour-alone; shape-differentiated for
 *   colour-blind users; text always readable by AT.
 * - Styles come from NavAIgator design tokens.
 * - Labels + sort order come from `statusPresenter` in
 *   `@/domain/bookings/status`, the single source of truth.
 */

const STATUS_VARIANT: Record<BookingStatus, "danger" | "warning" | "success" | "info" | "neutral" | "accent"> = {
  pending: "warning",
  confirmed: "success",
  in_transit: "info",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_EMPHASIS: Record<BookingStatus, "low" | "high"> = {
  pending: "high",
  confirmed: "high",
  in_transit: "high",
  delivered: "high",
  cancelled: "high",
};

export const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const { label } = statusPresenter(status);

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      emphasis={STATUS_EMPHASIS[status]}
      size="sm"
    >
      {label}
    </Badge>
  );
});
