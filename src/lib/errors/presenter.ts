import { ApiError, type ApiErrorKind } from "@/services/api/errors";

/**
 * Error → user-facing message.
 *
 * Callers render `{ title, body, canRetry }`; they do NOT read
 * `err.message`. Keeps internal strings (stack traces, raw server
 * responses) out of the UI.
 */

export interface UserFacingMessage {
  title: string;
  body: string;
  canRetry: boolean;
  kind: ApiErrorKind;
}

export function toUserFacingMessage(err: unknown): UserFacingMessage {
  if (err instanceof ApiError) return BY_KIND[err.kind];
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
