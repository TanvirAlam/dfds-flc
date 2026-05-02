import { render, screen } from "@testing-library/react";
import type { BookingStatus } from "@/domain/bookings/types";
import { StatusBadge } from "@/components/bookings/StatusBadge";

const CASES: Array<[BookingStatus, string]> = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["in_transit", "In transit"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

describe("StatusBadge", () => {
  it.each(CASES)("renders %s with the human label", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each(CASES)("renders a decorative icon for %s", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Icon is decorative; the text carries the meaning.
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("consumes status design tokens, not hard-coded colours", () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.backgroundColor).toContain("var(--status-pending-bg)");
    expect(badge.style.color).toContain("var(--status-pending-fg)");
  });

  it("uses the `in-transit` token (kebab-case) for `in_transit` status", () => {
    // Regression guard: status is `in_transit` (snake) but the CSS token
    // is `--status-in-transit-*` (kebab).
    const { container } = render(<StatusBadge status="in_transit" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.backgroundColor).toContain("var(--status-in-transit-bg)");
  });
});
