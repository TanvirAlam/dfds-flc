const DATE_TIME = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const WEIGHT = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

/** Format an ISO-8601 date-time. Returns the raw string on parse failure. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return DATE_TIME.format(d);
}

/** Format weight in kg with thousand separators. */
export function formatWeightKg(kg: number): string {
  return `${WEIGHT.format(kg)} kg`;
}

/** Stable key for sorting by ISO date; invalid dates sort last. */
export function dateSortKey(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}
