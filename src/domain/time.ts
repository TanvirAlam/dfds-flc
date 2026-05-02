/**
 * Time conversions between browser `<input type="datetime-local">` wall-clock
 * strings and ISO-8601 UTC strings.
 *
 * Lives in the domain layer because both the form (UI) and the data layer
 * share this concern; neither owns it. No React, no DOM — pure functions.
 */

/** `YYYY-MM-DDTHH:mm` in the user's local timezone. */
export type LocalDateTimeString = string;

/** ISO-8601 string as produced by `Date#toISOString()`. */
export type IsoDateTimeString = string;

/**
 * Convert an ISO-8601 string to the shape `<input type="datetime-local">`
 * wants (local wall-clock, no timezone). Returns an empty string for
 * invalid input so the input renders as "no value selected" rather than
 * the literal string "Invalid Date".
 */
export function isoToLocal(iso: IsoDateTimeString): LocalDateTimeString {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Convert a `<input type="datetime-local">` value to ISO-8601 UTC. The
 * Date constructor reads the input as *local* time across evergreen
 * browsers — which is what we want: the user typed wall-clock time.
 */
export function localToIso(local: LocalDateTimeString): IsoDateTimeString {
  return new Date(local).toISOString();
}
