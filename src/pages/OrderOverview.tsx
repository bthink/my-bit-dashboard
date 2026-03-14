import {useState, useCallback, useRef} from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {Button} from "../presentation/components/Button";
import {Modal} from "../presentation/components/Modal";
import {OrderDetailsModal} from "../presentation/components/OrderDetailsModal";
import {OrderForm} from "../presentation/components/OrderForm";
import {isOrderValidationError} from "../domain/orders/errors";
import type {Order} from "../domain/orders/order";
import type {CreateOrderInput} from "../domain/orders/order";
import type {OrderFieldErrors} from "../domain/orders/errors";

type FormMode = "create" | {edit: Order};

const formatPrice = (value: number): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  const [formOpen, setFormOpen] = useState<FormMode | null>(null);
  const [fieldErrors, setFieldErrors] = useState<OrderFieldErrors | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const openCreate = useCallback(() => {
    clearError();
    setFieldErrors(null);
    setFormOpen("create");
  }, [clearError]);

  const openEdit = useCallback(
    (order: Order) => {
      clearError();
      setFieldErrors(null);
      setViewOrder(null);
      setFormOpen({edit: order});
    },
    [clearError],
  );

  const openView = useCallback(
    (order: Order) => {
      clearError();
      setViewOrder(order);
    },
    [clearError],
  );

  const closeView = useCallback(() => {
    setViewOrder(null);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(null);
    setFieldErrors(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: CreateOrderInput) => {
      setFieldErrors(null);
      try {
        if (formOpen === "create") {
          await createOrder(values);
        } else if (formOpen && "edit" in formOpen) {
          await updateOrder(formOpen.edit.id, values);
        }
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
    [formOpen, createOrder, updateOrder, closeForm, clearError],
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

  const isFormOpen = formOpen !== null;
  const modalTitle = formOpen === "create" ? "Create order" : "Edit order";
  const formKey =
    formOpen === "create"
      ? "create"
      : formOpen !== null
        ? formOpen.edit.id
        : "create";
  const initialValues: CreateOrderInput | undefined =
    formOpen !== null && formOpen !== "create"
      ? {
          destinationCountry: formOpen.edit.destinationCountry,
          shippingDate: formOpen.edit.shippingDate,
          price: formOpen.edit.price,
        }
      : undefined;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Order overview
          </h1>
          <p className="text-sm text-slate-600">
            Inventory-style view for individual orders including CRUD actions.
          </p>
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
          className="flex items-center justify-between gap-4 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800"
          role="alert"
        >
          <span>{error}</span>
          <Button
            variant="danger"
            onClick={clearError}
            className="text-rose-700 hover:bg-rose-200 hover:text-rose-900"
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
              className="h-12 animate-pulse rounded-lg bg-slate-200"
              aria-hidden
            />
          ))}
        </div>
      )}

      {isInitialized && orders.length === 0 && (
        <div className="content-fade-in rounded-lg border border-slate-200 bg-slate-100 p-8 text-center">
          <p className="text-sm text-slate-600">No orders yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first order using the button above.
          </p>
        </div>
      )}

      {isInitialized && orders.length > 0 && (
        <div className="content-fade-in space-y-4">
          {isSaving && (
            <p className="text-sm text-slate-600" aria-live="polite">
              Saving…
            </p>
          )}
          <div
            className="overflow-hidden rounded-lg border border-slate-200"
            role="table"
            aria-label="Orders"
          >
            <div
              className="grid grid-cols-[minmax(140px,1fr)_minmax(100px,1fr)_minmax(80px,1fr)_auto] border-b border-slate-200 bg-slate-50 text-left text-sm"
              role="row"
            >
              <div
                className="px-4 py-3 font-medium text-slate-600"
                role="columnheader"
              >
                Destination country
              </div>
              <div
                className="px-4 py-3 font-medium text-slate-600"
                role="columnheader"
              >
                Shipping date
              </div>
              <div
                className="px-4 py-3 font-medium text-slate-600"
                role="columnheader"
              >
                Price
              </div>
              <div
                className="px-4 py-3 font-medium text-slate-600"
                role="columnheader"
              >
                Actions
              </div>
            </div>
            <div
              ref={scrollParentRef}
              className="overflow-auto max-h-[60vh] min-h-[120px]"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                  width: "100%",
                  minWidth: 480,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const order = orders[virtualRow.index];
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
                      className="grid grid-cols-[minmax(140px,1fr)_minmax(100px,1fr)_minmax(80px,1fr)_auto] border-b border-slate-200 text-left text-sm transition-colors hover:bg-slate-50"
                      role="row"
                    >
                      <div
                        className="px-4 py-3 text-slate-800"
                        role="cell"
                      >
                        {order.destinationCountry}
                      </div>
                      <div
                        className="px-4 py-3 text-slate-800"
                        role="cell"
                      >
                        {order.shippingDate}
                      </div>
                      <div
                        className="px-4 py-3 text-slate-800"
                        role="cell"
                      >
                        {formatPrice(order.price)}
                      </div>
                      <div
                        className="px-4 py-3"
                        role="cell"
                      >
                        {deletingId === order.id ? (
                          <span className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">Delete?</span>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteConfirm(order.id)}
                              disabled={isSaving}
                            >
                              Yes
                            </Button>
                            <Button
                              onClick={handleDeleteCancel}
                              disabled={isSaving}
                            >
                              No
                            </Button>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Button
                              onClick={() => openView(order)}
                              disabled={isSaving}
                            >
                              View
                            </Button>
                            <Button
                              variant="primaryOutline"
                              onClick={() => openEdit(order)}
                              disabled={isSaving}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteClick(order.id)}
                              disabled={isSaving}
                            >
                              Delete
                            </Button>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={closeForm} title={modalTitle}>
        <OrderForm
          key={formKey}
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          fieldErrors={fieldErrors}
          isSubmitting={isSaving}
        />
      </Modal>

      <OrderDetailsModal
        order={viewOrder}
        isOpen={viewOrder !== null}
        onClose={closeView}
        onEdit={openEdit}
      />
    </div>
  );
};

export default OrderOverview;
