/**
 * Inline stroke icons used by `StatusBadge` and anywhere else a booking
 * status is represented visually.
 *
 * Kept stroke-only with `currentColor` so they inherit the parent's text
 * colour. No external icon library: five icons is below the threshold
 * where a dependency is worth its audit + bundle cost.
 */

export type IconComponent = (props: { className?: string }) => React.JSX.Element;

const SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function TruckIcon({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.75" />
      <circle cx="17" cy="18" r="1.75" />
    </svg>
  );
}

export function PackageCheckIcon({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <path d="M21 10v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 18v-8" />
      <path d="m3.5 7.5 8.5 4.5 8.5-4.5" />
      <path d="M12 22V12" />
      <path d="m8.5 12.5 2 2 3-3" />
    </svg>
  );
}

export function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}
