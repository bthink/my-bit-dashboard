import {describe, it, expect} from "vitest";
import {createOrder, getOrder, updateOrder, deleteOrder} from "./useCases";
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
} from "../../domain/orders/order";

const baseOrder: Order = {
  id: "order-1",
  destinationCountry: "Germany",
  shippingDate: "2024-03-15",
  price: 100,
  createdAt: "2024-03-01T10:00:00.000Z",
  updatedAt: "2024-03-01T10:00:00.000Z",
};

describe("createOrder", () => {
  it("appends a new order with generated id and timestamps", () => {
    const input: CreateOrderInput = {
      destinationCountry: "France",
      shippingDate: "2024-04-01",
      price: 250.5,
    };
    const orders: Order[] = [baseOrder];
    const result = createOrder(orders, input);

    expect(result).toHaveLength(2);
    expect(result[1].destinationCountry).toBe("France");
    expect(result[1].shippingDate).toBe("2024-04-01");
    expect(result[1].price).toBe(250.5);
    expect(result[1].id).toBeDefined();
    expect(result[1].id).not.toBe(baseOrder.id);
    expect(result[1].createdAt).toBeDefined();
    expect(result[1].updatedAt).toBeDefined();
  });

  it("throws on validation failure", () => {
    const invalidInput: CreateOrderInput = {
      destinationCountry: "",
      shippingDate: "2024-03-15",
      price: 50,
    };
    expect(() => createOrder([], invalidInput)).toThrow();
  });
});

describe("getOrder", () => {
  it("returns order when found", () => {
    const orders: Order[] = [baseOrder];
    expect(getOrder(orders, "order-1")).toEqual(baseOrder);
  });

  it("throws OrderNotFoundError when id does not exist", () => {
    expect(() => getOrder([], "missing-id")).toThrow(/not found/);
    expect(() => getOrder([baseOrder], "missing-id")).toThrow(/not found/);
  });
});

describe("updateOrder", () => {
  it("updates existing order and preserves id and createdAt", () => {
    const input: UpdateOrderInput = {
      destinationCountry: "Austria",
      shippingDate: "2024-05-10",
      price: 300,
    };
    const orders: Order[] = [baseOrder];
    const result = updateOrder(orders, "order-1", input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("order-1");
    expect(result[0].destinationCountry).toBe("Austria");
    expect(result[0].shippingDate).toBe("2024-05-10");
    expect(result[0].price).toBe(300);
    expect(result[0].createdAt).toBe(baseOrder.createdAt);
    expect(result[0].updatedAt).not.toBe(baseOrder.updatedAt);
  });

  it("throws OrderNotFoundError when id does not exist", () => {
    const input: UpdateOrderInput = {
      destinationCountry: "Germany",
      shippingDate: "2024-03-15",
      price: 100,
    };
    expect(() => updateOrder([baseOrder], "missing-id", input)).toThrow(
      /not found/,
    );
  });

  it("throws on validation failure", () => {
    const invalidInput: UpdateOrderInput = {
      destinationCountry: "",
      shippingDate: "2024-03-15",
      price: 100,
    };
    expect(() => updateOrder([baseOrder], "order-1", invalidInput)).toThrow();
  });
});

describe("deleteOrder", () => {
  it("removes order by id", () => {
    const orders: Order[] = [baseOrder];
    const result = deleteOrder(orders, "order-1");

    expect(result).toHaveLength(0);
  });

  it("throws OrderNotFoundError when id does not exist", () => {
    expect(() => deleteOrder([baseOrder], "missing-id")).toThrow(/not found/);
  });
});
