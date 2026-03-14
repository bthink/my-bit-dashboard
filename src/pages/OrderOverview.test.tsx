import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from "react-router-dom";
import OrderOverview from "./OrderOverview";
import type {Order} from "../domain/orders/order";
import type {CreateOrderInput} from "../domain/orders/order";

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: (config: {count: number}) => ({
    getVirtualItems: () =>
      Array.from({length: config.count}, (_, i) => ({
        index: i,
        start: i * 52,
        size: 52,
        end: (i + 1) * 52,
        key: i,
        measureElement: () => {},
      })),
    getTotalSize: () => config.count * 52,
  }),
}));

const mockOrder: Order = {
  id: "order-1",
  destinationCountry: "Germany",
  shippingDate: "2024-03-15",
  price: 100,
  createdAt: "2024-03-01T10:00:00.000Z",
  updatedAt: "2024-03-01T10:00:00.000Z",
};

const initialOrders: Order[] = [mockOrder];

vi.mock("../presentation/hooks/useOrdersStore", async () => {
  const React = await import("react");

  return {
    useOrdersStore: () => {
      const [orders, setOrders] = React.useState<Order[]>(() => initialOrders);

      const createOrder = React.useCallback(async (input: CreateOrderInput) => {
        const newOrder: Order = {
          id: `new-${Date.now()}`,
          ...input,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOrders((prev) => [...prev, newOrder]);
      }, []);

      const updateOrder = React.useCallback(
        async (id: string, input: CreateOrderInput) => {
          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.id === id);
            if (idx < 0) return prev;
            return [
              ...prev.slice(0, idx),
              {
                ...prev[idx],
                ...input,
                updatedAt: new Date().toISOString(),
              },
              ...prev.slice(idx + 1),
            ];
          });
        },
        [],
      );

      const deleteOrder = React.useCallback(async (id: string) => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }, []);

      return {
        orders,
        isInitialized: true,
        isLoading: false,
        isSaving: false,
        error: null,
        getOrder: (id: string) => orders.find((o) => o.id === id)!,
        createOrder,
        updateOrder,
        deleteOrder,
        replaceOrders: vi.fn(),
        clearError: vi.fn(),
      };
    },
  };
});

const renderWithRouter = () =>
  render(
    <div style={{height: "600px", display: "flex", flexDirection: "column"}}>
      <MemoryRouter>
        <OrderOverview />
      </MemoryRouter>
    </div>,
  );

describe("OrderOverview", () => {
  beforeEach(() => {
    initialOrders.length = 0;
    initialOrders.push(mockOrder);
  });

  it("renders initial orders and reflects create mutation reactively", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    expect(screen.getByRole("table", {name: /orders/i})).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();

    const createBtn = screen.getByRole("button", {name: /create order/i});
    await user.click(createBtn);

    const countrySelect = await screen.findByLabelText(/destination country/i);
    await user.selectOptions(countrySelect, "France");

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, "250.5");

    const dialog = screen.getByRole("dialog", {name: /create order/i});
    const submitBtn = within(dialog).getByRole("button", {
      name: /^create order$/i,
    });
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.getByText("France")).toBeInTheDocument();
        expect(screen.getByText("250.50")).toBeInTheDocument();
      },
      {timeout: 500},
    );
  });
});
