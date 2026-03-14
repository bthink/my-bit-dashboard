import {useEffect} from "react";
import {useSyncExternalStore} from "react";
import {OrderStore} from "../../application/orders/orderStore";
import {createLocalStorageOrderRepository} from "../../infrastructure/orders/localStorageOrderRepository";

const repository = createLocalStorageOrderRepository();
const orderStore = new OrderStore(repository);

const getServerSnapshot = () => {
  return orderStore.getSnapshot();
};

export const useOrdersStore = () => {
  const snapshot = useSyncExternalStore(
    (listener) => orderStore.subscribe(listener),
    () => orderStore.getSnapshot(),
    getServerSnapshot,
  );

  useEffect(() => {
    orderStore.initialize();
  }, []);

  return {
    ...snapshot,
    getOrder: orderStore.getOrder.bind(orderStore),
    createOrder: orderStore.createOrder.bind(orderStore),
    updateOrder: orderStore.updateOrder.bind(orderStore),
    deleteOrder: orderStore.deleteOrder.bind(orderStore),
    replaceOrders: orderStore.replaceOrders.bind(orderStore),
    clearError: orderStore.clearError.bind(orderStore),
  };
};
