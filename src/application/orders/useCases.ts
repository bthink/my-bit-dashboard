import {createOrderNotFoundError} from "../../domain/orders/errors";
import type {
  CreateOrderInput,
  Order,
  OrderId,
  UpdateOrderInput,
} from "../../domain/orders/order";
import {isAllowedDestinationCountry} from "../../domain/orders/countries";
import {
  normalizeOrderInput,
  validateOrderInput,
} from "../../domain/orders/validation";

const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const nowIso = (): string => {
  return new Date().toISOString();
};

const createOrder = (
  orders: readonly Order[],
  input: CreateOrderInput,
): Order[] => {
  const normalized = normalizeOrderInput(input);
  validateOrderInput(normalized);

  const order: Order = {
    id: generateId(),
    destinationCountry: normalized.destinationCountry,
    shippingDate: normalized.shippingDate,
    price: normalized.price,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  return [...orders, order];
};

const getOrder = (orders: Order[], id: OrderId): Order => {
  const order = orders.find((o) => o.id === id);
  if (!order) {
    throw createOrderNotFoundError(`Order with id "${id}" not found.`);
  }
  return order;
};

const updateOrder = (
  orders: Order[],
  id: OrderId,
  input: UpdateOrderInput,
): Order[] => {
  const index = orders.findIndex((o) => o.id === id);
  const existing = index >= 0 ? orders[index] : undefined;
  if (!existing) {
    throw createOrderNotFoundError(`Order with id "${id}" not found.`);
  }

  const normalized = normalizeOrderInput(input);
  const allowLegacyCountry = isAllowedDestinationCountry(
    existing.destinationCountry,
  )
    ? undefined
    : existing.destinationCountry;
  validateOrderInput(normalized, {allowLegacyCountry});

  const updated: Order = {
    ...existing,
    destinationCountry: normalized.destinationCountry,
    shippingDate: normalized.shippingDate,
    price: normalized.price,
    updatedAt: nowIso(),
  };
  const next = [...orders];
  next[index] = updated;
  return next;
};

const deleteOrder = (orders: Order[], id: OrderId): Order[] => {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    throw createOrderNotFoundError(`Order with id "${id}" not found.`);
  }
  return orders.filter((o) => o.id !== id);
};

export {createOrder, getOrder, updateOrder, deleteOrder};
