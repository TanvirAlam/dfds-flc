import { act, renderHook } from "@testing-library/react";
import { useTableSort } from "@/lib/hooks/useTableSort";

describe("useTableSort", () => {
  it("initialises with the given key + direction", () => {
    const { result } = renderHook(() => useTableSort("a", "asc"));
    expect(result.current.sort).toEqual({ key: "a", dir: "asc" });
  });

  it("toggling the same key flips direction", () => {
    const { result } = renderHook(() => useTableSort("a", "asc"));
    act(() => result.current.toggle("a"));
    expect(result.current.sort).toEqual({ key: "a", dir: "desc" });
    act(() => result.current.toggle("a"));
    expect(result.current.sort).toEqual({ key: "a", dir: "asc" });
  });

  it("switching keys uses the `defaultDir` resolver", () => {
    const defaultDir = jest.fn((k: "a" | "b") =>
      k === "b" ? ("desc" as const) : ("asc" as const),
    );
    const { result } = renderHook(() => useTableSort<"a" | "b">("a", "asc", defaultDir));

    act(() => result.current.toggle("b"));
    expect(result.current.sort).toEqual({ key: "b", dir: "desc" });
    expect(defaultDir).toHaveBeenCalledWith("b");
  });

  it("keeps toggle identity stable when defaultDir is a stable reference", () => {
    // The hook memoises `toggle` on `defaultDir`, so a stable resolver
    // passed from the caller (usually a top-level function) yields a
    // stable `toggle`. Callers can rely on this to avoid re-rendering
    // memoised header buttons on every parent render.
    const stableDefaultDir = (_k: "a") => "asc" as const;
    const { result, rerender } = renderHook(() =>
      useTableSort("a", "asc", stableDefaultDir),
    );
    const first = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(first);
  });
});
