import type {Order} from "../../domain/orders/order";
import {isOrderLike} from "../../domain/orders/guards";
import type {OrderRepository} from "../../application/orders/orderRepository";

const STORAGE_KEY = "order-management-dashboard-orders";

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const createLocalStorageOrderRepository = (): OrderRepository => ({
  async loadOrders(): Promise<Order[]> {
    const storage = getStorage();
    if (!storage) return [];

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(isOrderLike);
    } catch {
      return [];
    }
  },

  async saveOrders(orders: Order[]): Promise<void> {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      throw new Error("Failed to persist orders to localStorage.");
    }
  },
});

export {createLocalStorageOrderRepository};
