import {Button} from "../presentation/components/Button";
import {OrderDetailsModal} from "../presentation/components/OrderDetailsModal";
import {OrderFormModal} from "../presentation/components/OrderFormModal";
import {ConfirmDeleteModal} from "../presentation/components/ConfirmDeleteModal";
import {OrdersTable} from "./orderOverview/OrdersTable";
import {useOrderOverviewController} from "./orderOverview/useOrderOverviewController";

const OrderOverview = () => {
  const {
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
  } = useOrderOverviewController();

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
          <OrdersTable
            orders={sortedOrders}
            sort={sort}
            isSaving={isSaving}
            onSort={handleSort}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteClick}
          />
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
