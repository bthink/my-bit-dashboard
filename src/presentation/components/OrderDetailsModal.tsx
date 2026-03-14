import type {ReactNode} from "react";
import {Button} from "./Button";
import {Modal} from "./Modal";
import {OrderForm} from "./OrderForm";
import type {Order} from "../../domain/orders/order";
import type {CreateOrderInput} from "../../domain/orders/order";
import type {OrderFieldErrors} from "../../domain/orders/errors";

const formatPrice = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return value.includes("T")
    ? date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : date.toLocaleDateString(undefined, {dateStyle: "medium"});
};

type DetailRowProps = {
  label: string;
  children: ReactNode;
  mono?: boolean;
};

const DetailRow = ({label, children, mono}: DetailRowProps) => (
  <div>
    <dt className="font-medium text-[var(--color-text-soft)]">{label}</dt>
    <dd className={`ml-2 mt-0.5 text-[var(--color-text)]${mono ? " font-mono" : ""}`}>
      {children}
    </dd>
  </div>
);

type OrderDetailsModalProps = {
  order: Order | null;
  isOpen: boolean;
  mode: "view" | "edit";
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (values: CreateOrderInput) => Promise<void>;
  fieldErrors?: OrderFieldErrors | null;
  isSubmitting: boolean;
};

export const OrderDetailsModal = ({
  order,
  isOpen,
  mode,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  fieldErrors,
  isSubmitting,
}: OrderDetailsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit order" : "Order details"}
    >
      {order && (
        <div className="space-y-4">
          {mode === "edit" ? (
            <OrderForm
              key={`${order.id}-edit`}
              initialValues={{
                destinationCountry: order.destinationCountry,
                shippingDate: order.shippingDate,
                price: order.price,
              }}
              onSubmit={onSubmit}
              onCancel={onCancelEdit}
              fieldErrors={fieldErrors}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <dl className="grid gap-3 text-sm">
                <DetailRow label="ID" mono>
                  {order.id}
                </DetailRow>
                <DetailRow label="Destination country">
                  {order.destinationCountry}
                </DetailRow>
                <DetailRow label="Shipping date">
                  {formatDate(order.shippingDate)}
                </DetailRow>
                <DetailRow label="Price">{formatPrice(order.price)}</DetailRow>
                <DetailRow label="Created">
                  {formatDate(order.createdAt)}
                </DetailRow>
                <DetailRow label="Updated">
                  {formatDate(order.updatedAt)}
                </DetailRow>
              </dl>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="primary" size="md" onClick={onStartEdit}>
                  Edit
                </Button>
                <Button
                  size="md"
                  onClick={onClose}
                  className="border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};
