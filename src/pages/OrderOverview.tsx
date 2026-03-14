import {useState, useCallback, useRef, useMemo} from "react";
import {Eye, Pencil, Trash2} from "lucide-react";
import {useVirtualizer} from "@tanstack/react-virtual";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {Button} from "../presentation/components/Button";
import {OrderDetailsModal} from "../presentation/components/OrderDetailsModal";
import {OrderFormModal} from "../presentation/components/OrderFormModal";
import {ConfirmDeleteModal} from "../presentation/components/ConfirmDeleteModal";
import {SortableColumnHeader} from "../presentation/components/SortableColumnHeader";
import {isOrderValidationError} from "../domain/orders/errors";
import type {Order} from "../domain/orders/order";
import type {CreateOrderInput} from "../domain/orders/order";
import type {OrderFieldErrors} from "../domain/orders/errors";

type OrderModalState = {
  orderId: string;
  mode: "view" | "edit";
  editSource: "table" | "details";
};

type SortKey = "destinationCountry" | "shippingDate" | "price" | "createdAt";
type SortDir = "asc" | "desc";
const tableGridColumns =
  "grid-cols-[minmax(140px,1fr)_minmax(100px,1fr)_minmax(80px,1fr)_minmax(110px,1fr)_132px]";
const tableHeaderCellClass =
  "flex items-center gap-1 px-4 py-3 font-medium text-[var(--color-text-muted)]";

const formatPrice = (value: number): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const OrderOverview = () => {
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
  const [sort, setSort] = useState<{key: SortKey; dir: SortDir}>({
    key: "shippingDate",
    dir: "asc",
  });
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const sortedOrders = useMemo(() => {
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
  }, [orders, sort]);

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return {key, dir: prev.dir === "asc" ? "desc" : "asc"};
      }
      return {key, dir: "asc"};
    });
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: sortedOrders.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const openCreate = useCallback(() => {
    clearError();
    setFieldErrors(null);
    setCreateFormOpen(true);
  }, [clearError]);

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

  const closeForm = useCallback(() => {
    setCreateFormOpen(false);
    setFieldErrors(null);
  }, []);

  const handleCreateSubmit = useCallback(
    async (values: CreateOrderInput) => {
      setFieldErrors(null);
      try {
        await createOrder(values);
        closeForm();
      } catch (e) {
        if (isOrderValidationError(e)) {
          setFieldErrors(e.fieldErrors);
          clearError();
          throw e;
        }
        setFieldErrors(null);
        throw e;
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
      } catch (e) {
        if (isOrderValidationError(e)) {
          setFieldErrors(e.fieldErrors);
          clearError();
          throw e;
        }
        setFieldErrors(null);
        throw e;
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
        setDeletingId(null);
      } catch {
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

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Order overview
          </h1>
        </div>
        {isInitialized && (
          <Button
            variant="primary"
            size="md"
            onClick={openCreate}
            disabled={isSaving}
          >
            Create order
          </Button>
        )}
      </header>

      {error && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-danger-ring)] bg-[var(--color-danger-soft)] p-4 text-sm text-[var(--color-danger-hover)]"
          role="alert"
        >
          <span>{error}</span>
          <Button
            variant="danger"
            onClick={clearError}
            className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger-hover)]"
          >
            Dismiss
          </Button>
        </div>
      )}

      {!isInitialized && isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-[var(--color-surface-muted)]"
              aria-hidden
            />
          ))}
        </div>
      )}

      {isInitialized && orders.length === 0 && (
        <div className="content-fade-in rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            No orders yet.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-soft)]">
            Create your first order using the button above.
          </p>
        </div>
      )}

      {isInitialized && orders.length > 0 && (
        <div className="content-fade-in flex min-h-0 flex-1 flex-col gap-4">
          {isSaving && (
            <p
              className="text-sm text-[var(--color-text-muted)]"
              aria-live="polite"
            >
              Saving…
            </p>
          )}
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--color-border)]"
            role="table"
            aria-label="Orders"
          >
            <div
              className={`grid ${tableGridColumns} shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-left text-sm`}
              role="row"
              style={{minWidth: 560}}
            >
              <div className={tableHeaderCellClass} role="columnheader">
                <SortableColumnHeader
                  sortKey="destinationCountry"
                  sort={sort}
                  onSort={handleSort}
                >
                  Destination
                </SortableColumnHeader>
              </div>
              <div className={tableHeaderCellClass} role="columnheader">
                <SortableColumnHeader
                  sortKey="shippingDate"
                  sort={sort}
                  onSort={handleSort}
                >
                  Shipping date
                </SortableColumnHeader>
              </div>
              <div className={tableHeaderCellClass} role="columnheader">
                <SortableColumnHeader
                  sortKey="price"
                  sort={sort}
                  onSort={handleSort}
                >
                  Price
                </SortableColumnHeader>
              </div>
              <div className={tableHeaderCellClass} role="columnheader">
                <SortableColumnHeader
                  sortKey="createdAt"
                  sort={sort}
                  onSort={handleSort}
                >
                  Created at
                </SortableColumnHeader>
              </div>
              <div
                className="flex items-center px-4 py-3 font-medium text-[var(--color-text-muted)]"
                role="columnheader"
              >
                Actions
              </div>
            </div>
            <div
              ref={scrollParentRef}
              className="themed-scrollbar min-h-0 flex-1 overflow-auto"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                  width: "100%",
                  minWidth: 560,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const order = sortedOrders[virtualRow.index];
                  return (
                    <div
                      key={order.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className={`grid ${tableGridColumns} border-b border-[var(--color-border)] text-left text-sm transition-colors hover:bg-[var(--color-surface-soft)]`}
                      role="row"
                    >
                      <div
                        className="flex items-center px-4 py-3 text-[var(--color-text)]"
                        role="cell"
                      >
                        {order.destinationCountry}
                      </div>
                      <div
                        className="flex items-center px-4 py-3 text-[var(--color-text)]"
                        role="cell"
                      >
                        {order.shippingDate}
                      </div>
                      <div
                        className="flex items-center px-4 py-3 text-[var(--color-text)]"
                        role="cell"
                      >
                        {formatPrice(order.price)}
                      </div>
                      <div
                        className="flex items-center px-4 py-3 text-[var(--color-text)]"
                        role="cell"
                      >
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center px-4 py-3" role="cell">
                        <span className="flex items-center gap-1">
                          <Button
                            size="icon"
                            onClick={() => openView(order)}
                            disabled={isSaving}
                            title="View"
                            aria-label={`View order ${order.id}`}
                          >
                            <Eye size={18} aria-hidden />
                          </Button>
                          <Button
                            variant="primaryOutline"
                            size="icon"
                            onClick={() => openEdit(order)}
                            disabled={isSaving}
                            title="Edit"
                            aria-label={`Edit order ${order.id}`}
                          >
                            <Pencil size={18} aria-hidden />
                          </Button>
                          <Button
                            variant="danger"
                            size="icon"
                            onClick={() => handleDeleteClick(order.id)}
                            disabled={isSaving}
                            title="Delete"
                            aria-label={`Delete order ${order.id}`}
                          >
                            <Trash2 size={18} aria-hidden />
                          </Button>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderFormModal
        isOpen={createFormOpen}
        onClose={closeForm}
        title="Create order"
        formKey="create"
        onSubmit={handleCreateSubmit}
        fieldErrors={fieldErrors}
        isSubmitting={isSaving}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={orderModalState !== null}
        mode={orderModalState?.mode ?? "view"}
        onClose={closeOrderModal}
        onStartEdit={switchOrderModalToEdit}
        onCancelEdit={switchOrderModalToView}
        onSubmit={handleEditSubmit}
        fieldErrors={fieldErrors}
        isSubmitting={isSaving}
      />

      <ConfirmDeleteModal
        order={orderToDelete}
        isOpen={deletingId !== null}
        onClose={handleDeleteCancel}
        onConfirm={() =>
          deletingId !== null ? handleDeleteConfirm(deletingId) : undefined
        }
        isDeleting={isSaving}
      />
    </div>
  );
};

export default OrderOverview;
