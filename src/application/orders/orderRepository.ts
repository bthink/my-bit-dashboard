import type {Order} from "../../domain/orders/order";

export interface OrderRepository {
  loadOrders(): Promise<Order[]>;
  saveOrders(orders: Order[]): Promise<void>;
}
