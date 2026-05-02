import { ApiError } from "@/services/api/errors";

/**
 * Error logging.
 *
 * One entry point so:
 *   - every catch in the app logs consistently (`[error] <context>`),
 *   - aborts don't pollute the console,
 *   - swapping to Sentry / OTel is a one-file change.
 */

const IS_DEV = import.meta.env?.DEV ?? false;

export function reportError(context: string, err: unknown): void {
  if (err instanceof DOMException && err.name === "AbortError") return;

  if (IS_DEV) {
    /* eslint-disable no-console */
    console.groupCollapsed(`[error] ${context}`);
    if (err instanceof ApiError) {
      console.log("kind:", err.kind);
      console.log("status:", err.status);
      console.log("path:", err.path);
      console.log("body:", err.body);
    }
    console.log("error:", err);
    console.groupEnd();
    /* eslint-enable no-console */
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`[error] ${context}`, summarise(err));
}

function summarise(err: unknown): string {
  if (err instanceof ApiError) {
    return `${err.kind} ${err.status ?? "-"} ${err.path}`;
  }
  if (err instanceof Error) return err.name;
  return typeof err;
}
