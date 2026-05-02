import { z } from "zod";
import { zodErrorToFieldMap } from "./schemas";

/**
 * HTTP-level error taxonomy for the client.
 *
 * Classified at the throw site so UI code never has to re-inspect
 * `status` to decide "should I retry?" or "is this a field error?".
 */
export type ApiErrorKind =
  | "network"
  | "validation"
  | "client"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** `null` when `fetch` rejected before we got a response. */
  readonly status: number | null;
  readonly body: unknown;
  readonly path: string;

  constructor(args: {
    kind: ApiErrorKind;
    status: number | null;
    message: string;
    body: unknown;
    path: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.kind = args.kind;
    this.status = args.status;
    this.body = args.body;
    this.path = args.path;
  }

  /**
   * Pull field-level validation errors out of a server 400. Lives here
   * (not in the form) because it's an HTTP concern — reading the
   * server's error envelope, which is a transport shape.
   *
   * Returns `null` when the error isn't field-shaped; callers should
   * fall back to a root-level message.
   */
  fieldErrors(): Record<string, string> | null {
    if (this.status !== 400) return null;

    const body = this.body as { error?: string } | null;
    const raw = body?.error;
    if (!raw) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      const issues = parsed
        .filter(
          (i): i is { path?: unknown[]; message?: string } =>
            typeof i === "object" && i !== null,
        )
        .map((i) => ({
          code: "custom" as const,
          path: Array.isArray(i.path) ? (i.path as (string | number)[]) : [],
          message:
            typeof i.message === "string" ? i.message : "Invalid value",
        }));

      if (issues.length === 0) return null;
      return zodErrorToFieldMap(new z.ZodError(issues));
    } catch {
      return null;
    }
  }
}

/**
 * Classify an HTTP status code. Pulled out so `request()` stays short
 * and the taxonomy is inspectable in isolation.
 */
export function classifyStatus(status: number): ApiErrorKind {
  if (status >= 500) return "server";
  if (status === 400) return "validation";
  if (status >= 400) return "client";
  return "unknown";
}
