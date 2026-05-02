import { dateSortKey, formatDateTime, formatWeightKg } from "@/lib/format";

describe("formatDateTime", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDateTime("2024-03-15T10:30:00Z");
    expect(result).toContain("2024");
    expect(result).toContain("Mar");
  });

  it("returns the raw string for an invalid date", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date");
  });

  it("handles empty string gracefully", () => {
    expect(formatDateTime("")).toBe("");
  });
});

describe("formatWeightKg", () => {
  it("appends kg unit", () => {
    expect(formatWeightKg(500)).toContain("kg");
  });

  it("formats large numbers with separators", () => {
    const result = formatWeightKg(12345);
    // Locale-dependent separator, but value and unit should appear.
    expect(result).toContain("kg");
    expect(result).toMatch(/12.?345/);
  });

  it("handles zero", () => {
    expect(formatWeightKg(0)).toContain("0");
  });
});

describe("dateSortKey", () => {
  it("returns the timestamp for a valid ISO date", () => {
    const iso = "2024-01-01T00:00:00Z";
    expect(dateSortKey(iso)).toBe(new Date(iso).getTime());
  });

  it("returns Infinity for an invalid date", () => {
    expect(dateSortKey("invalid")).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns Infinity for empty string", () => {
    expect(dateSortKey("")).toBe(Number.POSITIVE_INFINITY);
  });

  it("preserves chronological order", () => {
    const earlier = dateSortKey("2024-01-01T00:00:00Z");
    const later = dateSortKey("2024-06-01T00:00:00Z");
    expect(earlier).toBeLessThan(later);
  });
});
