import { render, screen } from "@testing-library/react";
import { Field, TextInput } from "@/components/ui/Field";

describe("Field", () => {
  it("associates the label with the child input via htmlFor / id", () => {
    render(
      <Field label="Customer" htmlFor="customer">
        <TextInput id="customer" aria-invalid={false} />
      </Field>,
    );
    // getByLabelText succeeds only if the label is correctly associated.
    expect(screen.getByLabelText("Customer")).toBeInTheDocument();
  });

  it("shows a red required asterisk when required", () => {
    render(
      <Field label="Customer" htmlFor="x" required>
        <TextInput id="x" />
      </Field>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows an Optional pill when optional", () => {
    render(
      <Field label="Notes" htmlFor="notes" optional>
        <TextInput id="notes" />
      </Field>,
    );
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("renders the hint when no error", () => {
    render(
      <Field label="A" htmlFor="a" hint="Whole kilograms">
        <TextInput id="a" />
      </Field>,
    );
    expect(screen.getByText("Whole kilograms")).toBeInTheDocument();
  });

  it("replaces the hint with the error when provided", () => {
    render(
      <Field label="A" htmlFor="a" hint="Whole kilograms" error="Required">
        <TextInput id="a" />
      </Field>,
    );
    expect(screen.queryByText("Whole kilograms")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("omits the message row entirely when there is no hint or error", () => {
    const { container } = render(
      <Field label="A" htmlFor="a">
        <TextInput id="a" />
      </Field>,
    );
    // No <p> sibling below the input — keeps rows compact.
    expect(container.querySelectorAll("p").length).toBe(0);
  });
});

describe("TextInput", () => {
  it("applies aria-invalid when flagged", () => {
    render(<TextInput id="x" aria-invalid />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
