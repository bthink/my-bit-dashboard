import type {ReactNode} from "react";
import {Button} from "./Button";
import {Modal} from "./Modal";
import type {Order} from "../../domain/orders/order";

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
    <dt className="font-medium text-slate-500">{label}</dt>
    <dd className={`ml-2 mt-0.5 text-slate-800${mono ? " font-mono" : ""}`}>
      {children}
    </dd>
  </div>
);

type OrderDetailsModalProps = {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
};

export const OrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  onEdit,
}: OrderDetailsModalProps) => {
  const handleEdit = () => {
    if (!order) return;
    onClose();
    onEdit(order);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order details">
      {order && (
        <div className="space-y-4">
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
            <DetailRow label="Created">{formatDate(order.createdAt)}</DetailRow>
            <DetailRow label="Updated">{formatDate(order.updatedAt)}</DetailRow>
          </dl>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" size="md" onClick={handleEdit}>
              Edit
            </Button>
            <Button
              size="md"
              onClick={onClose}
              className="border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
