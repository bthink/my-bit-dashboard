import {describe, it, expect, vi, beforeEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import type {CreateOrderInput, Order} from "../../domain/orders/order";
import {createOrderValidationError} from "../../domain/orders/errors";
import {useOrderOverviewController} from "./useOrderOverviewController";

const createOrderMock = vi.fn<(input: CreateOrderInput) => Promise<void>>();
const updateOrderMock =
  vi.fn<(id: string, input: CreateOrderInput) => Promise<void>>();
const clearErrorMock = vi.fn();

vi.mock("../../presentation/hooks/useOrdersStore", () => ({
  useOrdersStore: () => ({
    orders: [] as Order[],
    isInitialized: true,
    isLoading: false,
    isSaving: false,
    error: null,
    clearError: clearErrorMock,
    createOrder: createOrderMock,
    updateOrder: updateOrderMock,
    deleteOrder: vi.fn(),
  }),
}));

describe("useOrderOverviewController", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
    updateOrderMock.mockReset();
    clearErrorMock.mockReset();
  });

  it("handles create validation errors without rejecting submit handler", async () => {
    createOrderMock.mockRejectedValue(
      createOrderValidationError("Invalid order input.", {
        destinationCountry: "Destination country is required.",
      }),
    );

    const {result} = renderHook(() => useOrderOverviewController());

    await act(async () => {
      await expect(
        result.current.handleCreateSubmit({
          destinationCountry: "",
          shippingDate: "",
          price: 0,
        }),
      ).resolves.toBeUndefined();
    });

    expect(result.current.fieldErrors).toEqual({
      destinationCountry: "Destination country is required.",
    });
    expect(clearErrorMock).toHaveBeenCalledTimes(1);
  });
});
