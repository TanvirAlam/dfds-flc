import { ApiError, type ApiErrorKind } from "@/lib/api/client";
import { reportError, toUserFacingMessage } from "@/lib/errors";

function makeApiError(kind: ApiErrorKind, status: number | null = null) {
  return new ApiError({
    kind,
    status,
    message: "test",
    body: null,
    path: "/test",
  });
}

describe("toUserFacingMessage", () => {
  it.each<[ApiErrorKind, { canRetry: boolean }]>([
    ["network", { canRetry: true }],
    ["validation", { canRetry: false }],
    ["client", { canRetry: false }],
    ["server", { canRetry: true }],
  ])("classifies %s ApiError correctly", (kind, expected) => {
    const msg = toUserFacingMessage(makeApiError(kind));
    expect(msg.kind).toBe(kind);
    expect(msg.canRetry).toBe(expected.canRetry);
    expect(msg.title).toBeTruthy();
    expect(msg.body).toBeTruthy();
  });

  it("returns unknown for a plain Error", () => {
    const msg = toUserFacingMessage(new Error("boom"));
    expect(msg.kind).toBe("unknown");
    expect(msg.canRetry).toBe(true);
  });

  it("returns unknown for a non-Error throw", () => {
    const msg = toUserFacingMessage("string error");
    expect(msg.kind).toBe("unknown");
  });

  it("never leaks the raw error message to the user", () => {
    const secret = "SECRET INTERNAL STACK TRACE";
    const msg = toUserFacingMessage(new Error(secret));
    expect(msg.title + msg.body).not.toContain(secret);
  });
});

describe("reportError", () => {
  it("silently ignores AbortErrors", () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    const group = jest
      .spyOn(console, "groupCollapsed")
      .mockImplementation(() => {});

    reportError("test", new DOMException("aborted", "AbortError"));

    expect(err).not.toHaveBeenCalled();
    expect(group).not.toHaveBeenCalled();

    err.mockRestore();
    group.mockRestore();
  });
});
