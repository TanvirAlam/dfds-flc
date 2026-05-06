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

  it("renders badge component for pending status", () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.firstElementChild;
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders badge component for in_transit status", () => {
    const { container } = render(<StatusBadge status="in_transit" />);
    const badge = container.firstElementChild;
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("In transit")).toBeInTheDocument();
  });

  it("renders badge component for cancelled status", () => {
    const { container } = render(<StatusBadge status="cancelled" />);
    const badge = container.firstElementChild;
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });
});