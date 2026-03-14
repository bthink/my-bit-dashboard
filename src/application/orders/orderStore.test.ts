import { describe, it, expect, vi } from "vitest";
import { OrderStore } from "./orderStore";
import type { Order } from "../../domain/orders/order";
import type { OrderRepository } from "./orderRepository";

vi.mock("./delay", () => ({
  withDelay: <T>(fn: () => Promise<T>): Promise<T> => fn(),
}));

const createMockRepository = (
  initial: Order[] = [],
): OrderRepository & { getSaved: () => Order[] } => {
  let stored = [...initial];

  return {
    async loadOrders(): Promise<Order[]> {
      return [...stored];
    },

    async saveOrders(orders: Order[]): Promise<void> {
      stored = [...orders];
    },

    getSaved(): Order[] {
      return [...stored];
    },
  };
};

const sampleOrder: Order = {
  id: "o1",
  destinationCountry: "Germany",
  shippingDate: "2024-03-15",
  price: 100,
  createdAt: "2024-03-01T10:00:00Z",
  updatedAt: "2024-03-01T10:00:00Z",
};

describe("OrderStore", () => {
  describe("initialize", () => {
    it("loads orders from repository and marks initialized", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);

      expect(store.getSnapshot().isInitialized).toBe(false);
      expect(store.getSnapshot().isLoading).toBe(false);

      await store.initialize();

      const snap = store.getSnapshot();
      expect(snap.isInitialized).toBe(true);
      expect(snap.isLoading).toBe(false);
      expect(snap.orders).toHaveLength(1);
      expect(snap.orders[0]).toEqual(sampleOrder);
    });

    it("sets error on load failure", async () => {
      const repo: OrderRepository = {
        loadOrders: () => Promise.reject(new Error("Network error")),
        saveOrders: () => Promise.resolve(),
      };
      const store = new OrderStore(repo);

      await store.initialize();

      const snap = store.getSnapshot();
      expect(snap.isLoading).toBe(false);
      expect(snap.error).toBe("Network error");
    });

    it("is idempotent when already loading or initialized", async () => {
      let loadCount = 0;
      const repo: OrderRepository = {
        loadOrders: async () => {
          loadCount += 1;
          return [];
        },
        saveOrders: () => Promise.resolve(),
      };
      const store = new OrderStore(repo);

      await Promise.all([store.initialize(), store.initialize(), store.initialize()]);

      expect(loadCount).toBe(1);
      await store.initialize();
      expect(loadCount).toBe(1);
    });
  });

  describe("createOrder", () => {
    it("persists new order and updates state", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);
      await store.initialize();

      await store.createOrder({
        destinationCountry: "France",
        shippingDate: "2024-04-01",
        price: 200,
      });

      const snap = store.getSnapshot();
      expect(snap.orders).toHaveLength(2);
      expect(snap.orders[1].destinationCountry).toBe("France");
      expect(snap.isSaving).toBe(false);
      expect(repo.getSaved()).toHaveLength(2);
    });

    it("sets error and rethrows on validation failure", async () => {
      const repo = createMockRepository([]);
      const store = new OrderStore(repo);
      await store.initialize();

      await expect(
        store.createOrder({
          destinationCountry: "",
          shippingDate: "2024-03-15",
          price: 50,
        }),
      ).rejects.toThrow();

      const snap = store.getSnapshot();
      expect(snap.error).not.toBeNull();
    });

    it("sets error on save failure", async () => {
      const repo: OrderRepository = {
        loadOrders: () => Promise.resolve([]),
        saveOrders: () => Promise.reject(new Error("Storage full")),
      };
      const store = new OrderStore(repo);
      await store.initialize();

      await expect(
        store.createOrder({
          destinationCountry: "Germany",
          shippingDate: "2024-03-15",
          price: 100,
        }),
      ).rejects.toThrow("Storage full");

      const snap = store.getSnapshot();
      expect(snap.error).toContain("Storage full");
    });
  });

  describe("updateOrder", () => {
    it("persists update and updates state", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);
      await store.initialize();

      await store.updateOrder("o1", {
        destinationCountry: "Austria",
        shippingDate: "2024-05-10",
        price: 150,
      });

      const snap = store.getSnapshot();
      expect(snap.orders[0].destinationCountry).toBe("Austria");
      expect(snap.orders[0].price).toBe(150);
    });

    it("sets error and rethrows on not found", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);
      await store.initialize();

      await expect(
        store.updateOrder("missing", {
          destinationCountry: "Germany",
          shippingDate: "2024-03-15",
          price: 100,
        }),
      ).rejects.toThrow();

      const snap = store.getSnapshot();
      expect(snap.error).not.toBeNull();
    });
  });

  describe("deleteOrder", () => {
    it("persists deletion and updates state", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);
      await store.initialize();

      await store.deleteOrder("o1");

      const snap = store.getSnapshot();
      expect(snap.orders).toHaveLength(0);
      expect(repo.getSaved()).toHaveLength(0);
    });

    it("sets error and rethrows on not found", async () => {
      const repo = createMockRepository([sampleOrder]);
      const store = new OrderStore(repo);
      await store.initialize();

      await expect(store.deleteOrder("missing")).rejects.toThrow();

      const snap = store.getSnapshot();
      expect(snap.error).not.toBeNull();
    });
  });

  describe("clearError", () => {
    it("clears stored error", async () => {
      const repo: OrderRepository = {
        loadOrders: () => Promise.reject(new Error("Load failed")),
        saveOrders: () => Promise.resolve(),
      };
      const store = new OrderStore(repo);
      await store.initialize();

      expect(store.getSnapshot().error).toBe("Load failed");

      store.clearError();
      expect(store.getSnapshot().error).toBeNull();
    });
  });
});
