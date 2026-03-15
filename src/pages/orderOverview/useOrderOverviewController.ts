import {useCallback, useMemo, useState} from "react";
import {
  isOrderValidationError,
  type OrderFieldErrors,
} from "../../domain/orders/errors";
import type {CreateOrderInput, Order} from "../../domain/orders/order";
import {useOrdersStore} from "../../presentation/hooks/useOrdersStore";

export type OrderModalState = {
  orderId: string;
  mode: "view" | "edit";
  editSource: "table" | "details";
};

export type SortKey =
  | "destinationCountry"
  | "shippingDate"
  | "price"
  | "createdAt";
export type SortDir = "asc" | "desc";
export type SortState = {key: SortKey; dir: SortDir};

const sortOrders = (orders: Order[], sort: SortState): Order[] => {
  const {key: sortKey, dir: sortDir} = sort;
  return [...orders]
    .map((order, index) => ({order, index}))
    .sort((a, b) => {
      const aVal = a.order[sortKey];
      const bVal = b.order[sortKey];
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));

      if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
      return a.index - b.index;
    })
    .map(({order}) => order);
};

export const useOrderOverviewController = () => {
  const {
    orders,
    isInitialized,
    isLoading,
    isSaving,
    error,
    clearError,
    createOrder,
    updateOrder,
    deleteOrder,
  } = useOrdersStore();

  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<OrderFieldErrors | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [orderModalState, setOrderModalState] =
    useState<OrderModalState | null>(null);
  const [sort, setSort] = useState<SortState>({
    key: "shippingDate",
    dir: "asc",
  });

  const sortedOrders = useMemo(() => sortOrders(orders, sort), [orders, sort]);

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        return {key, dir: prev.dir === "asc" ? "desc" : "asc"};
      }
      return {key, dir: "asc"};
    });
  }, []);

  const openCreate = useCallback(() => {
    clearError();
    setFieldErrors(null);
    setCreateFormOpen(true);
  }, [clearError]);

  const closeForm = useCallback(() => {
    setCreateFormOpen(false);
    setFieldErrors(null);
  }, []);

  const openView = useCallback(
    (order: Order) => {
      clearError();
      setFieldErrors(null);
      setOrderModalState({
        orderId: order.id,
        mode: "view",
        editSource: "details",
      });
    },
    [clearError],
  );

  const openEdit = useCallback(
    (order: Order) => {
      clearError();
      setFieldErrors(null);
      setOrderModalState({
        orderId: order.id,
        mode: "edit",
        editSource: "table",
      });
    },
    [clearError],
  );

  const closeOrderModal = useCallback(() => {
    setOrderModalState(null);
    setFieldErrors(null);
  }, []);

  const switchOrderModalToEdit = useCallback(() => {
    setOrderModalState((prev) =>
      prev ? {...prev, mode: "edit", editSource: "details"} : prev,
    );
  }, []);

  const switchOrderModalToView = useCallback(() => {
    setFieldErrors(null);
    setOrderModalState((prev) => {
      if (!prev) return prev;
      if (prev.editSource === "table") return null;
      return {...prev, mode: "view"};
    });
  }, []);

  const handleCreateSubmit = useCallback(
    async (values: CreateOrderInput) => {
      setFieldErrors(null);
      try {
        await createOrder(values);
        closeForm();
      } catch (errorValue) {
        if (isOrderValidationError(errorValue)) {
          setFieldErrors(errorValue.fieldErrors);
          clearError();
          return;
        }
        setFieldErrors(null);
        return;
      }
    },
    [createOrder, closeForm, clearError],
  );

  const selectedOrder = useMemo(
    () =>
      orderModalState
        ? (orders.find((order) => order.id === orderModalState.orderId) ?? null)
        : null,
    [orderModalState, orders],
  );

  const handleEditSubmit = useCallback(
    async (values: CreateOrderInput) => {
      if (!selectedOrder) return;
      setFieldErrors(null);
      try {
        await updateOrder(selectedOrder.id, values);
        closeOrderModal();
      } catch (errorValue) {
        if (isOrderValidationError(errorValue)) {
          setFieldErrors(errorValue.fieldErrors);
          clearError();
          return;
        }
        setFieldErrors(null);
        return;
      }
    },
    [selectedOrder, updateOrder, closeOrderModal, clearError],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (id: string) => {
      try {
        await deleteOrder(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteOrder],
  );

  const handleDeleteCancel = useCallback(() => {
    setDeletingId(null);
  }, []);

  const orderToDelete = useMemo(
    () =>
      deletingId ? (orders.find((o) => o.id === deletingId) ?? null) : null,
    [deletingId, orders],
  );

  return {
    orders,
    sortedOrders,
    sort,
    isInitialized,
    isLoading,
    isSaving,
    error,
    clearError,
    createFormOpen,
    fieldErrors,
    deletingId,
    orderModalState,
    selectedOrder,
    orderToDelete,
    handleSort,
    openCreate,
    closeForm,
    openView,
    openEdit,
    closeOrderModal,
    switchOrderModalToEdit,
    switchOrderModalToView,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
