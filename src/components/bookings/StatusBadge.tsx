import type { BookingStatus } from "@/lib/api/types";

type Variant = {
  label: string;
  className: string;
  dotClassName: string;
};

const VARIANTS: Record<BookingStatus, Variant> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-900 ring-amber-200",
    dotClassName: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-sky-50 text-sky-900 ring-sky-200",
    dotClassName: "bg-sky-500",
  },
  in_transit: {
    label: "In transit",
    className: "bg-indigo-50 text-indigo-900 ring-indigo-200",
    dotClassName: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-900 ring-rose-200",
    dotClassName: "bg-rose-500",
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const v = VARIANTS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${v.className}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${v.dotClassName}`}
      />
      {v.label}
    </span>
  );
}
