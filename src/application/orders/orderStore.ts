import type {Order} from "../../domain/orders/order";
import type {
  CreateOrderInput,
  UpdateOrderInput,
} from "../../domain/orders/order";
import {
  isOrderNotFoundError,
  isOrderValidationError,
} from "../../domain/orders/errors";
import type {OrderRepository} from "./orderRepository";
import {createOrder, getOrder, updateOrder, deleteOrder} from "./useCases";
import {withDelay} from "./delay";

export type OrderStoreSnapshot = {
  orders: Order[];
  isInitialized: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

type Listener = () => void;

export class OrderStore {
  private orders: Order[] = [];
  private isInitialized = false;
  private isLoading = false;
  private isSaving = false;
  private error: string | null = null;
  private listeners = new Set<Listener>();
  private repo: OrderRepository;
  private cachedSnapshot: OrderStoreSnapshot | null = null;

  constructor(repo: OrderRepository) {
    this.repo = repo;
  }

  getSnapshot(): OrderStoreSnapshot {
    if (this.cachedSnapshot === null) {
      this.cachedSnapshot = this.buildSnapshot();
    }
    return this.cachedSnapshot;
  }

  private buildSnapshot(): OrderStoreSnapshot {
    return {
      orders: this.orders,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      isSaving: this.isSaving,
      error: this.error,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  private setState(partial: Partial<OrderStoreSnapshot>): void {
    if (partial.orders !== undefined) this.orders = partial.orders;
    if (partial.isInitialized !== undefined)
      this.isInitialized = partial.isInitialized;
    if (partial.isLoading !== undefined) this.isLoading = partial.isLoading;
    if (partial.isSaving !== undefined) this.isSaving = partial.isSaving;
    if (partial.error !== undefined) this.error = partial.error;
    this.cachedSnapshot = null;
    this.emit();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    this.setState({isLoading: true, error: null});
    try {
      const orders = await withDelay(() => this.repo.loadOrders());
      this.setState({
        orders,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        error: e instanceof Error ? e.message : "Failed to load orders.",
      });
    }
  }

  clearError(): void {
    this.setState({error: null});
  }

  getOrder(id: string): Order {
    return getOrder(this.orders, id);
  }

  async createOrder(input: CreateOrderInput): Promise<void> {
    this.setState({error: null, isSaving: true});
    try {
      const nextOrders = createOrder(this.orders, input);
      await withDelay(() => this.repo.saveOrders(nextOrders));
      this.setState({orders: nextOrders, isSaving: false, error: null});
    } catch (e) {
      this.setState({isSaving: false});
      if (isOrderValidationError(e)) {
        this.setState({error: e.message});
        throw e;
      }
      this.setState({
        error: e instanceof Error ? e.message : "Failed to create order.",
      });
      throw e;
    }
  }

  async updateOrder(id: string, input: UpdateOrderInput): Promise<void> {
    this.setState({error: null, isSaving: true});
    try {
      const nextOrders = updateOrder(this.orders, id, input);
      await withDelay(() => this.repo.saveOrders(nextOrders));
      this.setState({orders: nextOrders, isSaving: false, error: null});
    } catch (e) {
      this.setState({isSaving: false});
      if (isOrderValidationError(e) || isOrderNotFoundError(e)) {
        this.setState({error: e.message});
        throw e;
      }
      this.setState({
        error: e instanceof Error ? e.message : "Failed to update order.",
      });
      throw e;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    this.setState({error: null, isSaving: true});
    try {
      const nextOrders = deleteOrder(this.orders, id);
      await withDelay(() => this.repo.saveOrders(nextOrders));
      this.setState({orders: nextOrders, isSaving: false, error: null});
    } catch (e) {
      this.setState({isSaving: false});
      if (isOrderNotFoundError(e)) {
        this.setState({error: e.message});
        throw e;
      }
      this.setState({
        error: e instanceof Error ? e.message : "Failed to delete order.",
      });
      throw e;
    }
  }

  async replaceOrders(orders: Order[]): Promise<void> {
    this.setState({error: null, isSaving: true});
    try {
      await withDelay(() => this.repo.saveOrders(orders));
      this.setState({orders, isSaving: false, error: null});
    } catch (e) {
      this.setState({
        isSaving: false,
        error: e instanceof Error ? e.message : "Failed to replace orders.",
      });
      throw e;
    }
  }
}
