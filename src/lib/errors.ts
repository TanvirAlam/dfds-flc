/**
 * Centralised error presentation.
 *
 * Never show `err.message` directly to users. Funnel every caught error
 * through `toUserFacingMessage` so:
 *   - internal details (stack traces, raw server strings) never leak,
 *   - wording is consistent across the app,
 *   - new error classes pick up sensible defaults automatically.
 *
 * Logging goes through `reportError` so we have a single line to grep
 * for in the console and a single place to wire up Sentry / OpenTelemetry
 * later.
 */

import { ApiError, type ApiErrorKind } from "./api/client";

export interface UserFacingMessage {
  /** Short headline for the error card / toast title. */
  title: string;
  /** One-sentence friendly description. No payloads, no statuses. */
  body: string;
  /** Whether the UI should offer a retry. */
  canRetry: boolean;
  /** The underlying classification; lets callers style per kind. */
  kind: ApiErrorKind;
}

/**
 * Turn any caught value into something safe to render.
 *
 * The resulting `body` is deliberately generic — an internal ops tool
 * benefits from a predictable "something went wrong" shape rather than
 * ten bespoke sentences. Extra detail belongs in the console for the
 * team, not in the UI for the user.
 */
export function toUserFacingMessage(err: unknown): UserFacingMessage {
  if (err instanceof ApiError) {
    return BY_KIND[err.kind];
  }
  // A non-Error throw (string, object). Rare, but possible.
  return BY_KIND.unknown;
}

const BY_KIND: Record<ApiErrorKind, UserFacingMessage> = {
  network: {
    title: "Can't reach the server",
    body: "Your network or our server is unreachable. Check your connection and try again.",
    canRetry: true,
    kind: "network",
  },
  validation: {
    title: "Some fields need attention",
    body: "The server rejected the request. See the highlighted fields.",
    canRetry: false,
    kind: "validation",
  },
  client: {
    title: "Request could not be completed",
    body: "The requested item may have moved or no longer exist.",
    canRetry: false,
    kind: "client",
  },
  server: {
    title: "The server is having trouble",
    body: "We're looking into it. Try again in a moment.",
    canRetry: true,
    kind: "server",
  },
  unknown: {
    title: "Something went wrong",
    body: "An unexpected error occurred. If this keeps happening, refresh the page.",
    canRetry: true,
    kind: "unknown",
  },
};

/* ------------------------------------------------------------------ */
/* Logging                                                            */
/* ------------------------------------------------------------------ */

const IS_DEV = import.meta.env?.DEV ?? false;

/**
 * Log an error with consistent context. Never swallow errors silently
 * — any `catch` branch in app code should call this, even if the user
 * sees a friendly banner.
 *
 * Dev: full object tree so you can expand `body`, `cause`, etc.
 * Prod: single-line breadcrumb so console noise stays low. (Hook up to
 * a real sink like Sentry here when we have one.)
 */
export function reportError(context: string, err: unknown): void {
  if (err instanceof DOMException && err.name === "AbortError") {
    // Aborts are expected (navigation away from an in-flight request).
    // Not worth a log line.
    return;
  }

  if (IS_DEV) {
    // Group so each report is one collapsible entry.
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

  // Production: terse. A real deployment would forward to an external
  // sink here. We keep one line so the browser console isn't noisy.
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
