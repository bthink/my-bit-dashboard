import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {OrderForm} from "./OrderForm";

describe("OrderForm", () => {
  it("marks all order inputs as required", () => {
    render(
      <OrderForm
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(/destination country/i)).toBeRequired();
    expect(screen.getByLabelText(/shipping date/i)).toBeRequired();
    expect(screen.getByLabelText(/price/i)).toBeRequired();
  });

  it("renders provided initial values for edit mode", () => {
    render(
      <OrderForm
        initialValues={{
          destinationCountry: "Germany",
          shippingDate: "2026-03-20",
          price: 199.99,
        }}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(/destination country/i)).toHaveValue(
      "Germany",
    );
    expect(screen.getByLabelText(/shipping date/i)).toHaveValue("2026-03-20");
    expect(screen.getByLabelText(/price/i)).toHaveValue(199.99);
    expect(
      screen.getByRole("button", {
        name: /update order/i,
      }),
    ).toBeInTheDocument();
  });

  it("submits normalized payload with numeric price", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <OrderForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />,
    );

    await user.selectOptions(
      screen.getByLabelText(/destination country/i),
      "France",
    );
    await user.clear(screen.getByLabelText(/shipping date/i));
    await user.type(screen.getByLabelText(/shipping date/i), "2026-04-10");
    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), "250.5");
    await user.click(screen.getByRole("button", {name: /create order/i}));

    expect(onSubmit).toHaveBeenCalledWith({
      destinationCountry: "France",
      shippingDate: "2026-04-10",
      price: 250.5,
    });
  });

  it("shows validation messages and marks invalid fields", () => {
    render(
      <OrderForm
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
        isSubmitting={false}
        fieldErrors={{
          destinationCountry: "Destination country is required.",
          shippingDate: "Shipping date is required.",
          price: "Price must be greater than 0.",
        }}
      />,
    );

    expect(
      screen.getByText("Destination country is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Shipping date is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Price must be greater than 0."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/destination country/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/shipping date/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/price/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disables actions while submitting", () => {
    render(
      <OrderForm
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByRole("button", {name: /cancel/i})).toBeDisabled();
    expect(screen.getByRole("button", {name: /saving…/i})).toBeDisabled();
  });
});
