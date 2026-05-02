import type { BookingStatus } from "@/lib/api/types";

type Variant = {
  label: string;
  token: string;
  Icon: (props: { className?: string }) => React.JSX.Element;
};

const VARIANTS: Record<BookingStatus, Variant> = {
  pending: { label: "Pending", token: "pending", Icon: ClockIcon },
  confirmed: { label: "Confirmed", token: "confirmed", Icon: CheckIcon },
  in_transit: {
    label: "In transit",
    token: "in-transit",
    Icon: TruckIcon,
  },
  delivered: {
    label: "Delivered",
    token: "delivered",
    Icon: PackageCheckIcon,
  },
  cancelled: { label: "Cancelled", token: "cancelled", Icon: XCircleIcon },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const v = VARIANTS[status];

  const style = {
    backgroundColor: `var(--status-${v.token}-bg)`,
    color: `var(--status-${v.token}-fg)`,
    ["--tw-ring-color" as string]: `var(--status-${v.token}-ring)`,
  } as React.CSSProperties;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
      style={style}
    >
      <v.Icon className="h-3.5 w-3.5" />
      <span>{v.label}</span>
    </span>
  );
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.75" />
      <circle cx="17" cy="18" r="1.75" />
    </svg>
  );
}

function PackageCheckIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M21 10v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 18v-8" />
      <path d="m3.5 7.5 8.5 4.5 8.5-4.5" />
      <path d="M12 22V12" />
      <path d="m8.5 12.5 2 2 3-3" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}
