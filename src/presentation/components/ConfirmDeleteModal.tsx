import {Button} from "./Button";
import {Modal} from "./Modal";
import type {Order} from "../../domain/orders/order";

type ConfirmDeleteModalProps = {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting: boolean;
};

export const ConfirmDeleteModal = ({
  order,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: ConfirmDeleteModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete order">
    {order && (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          Are you sure you want to delete the order to{" "}
          <strong className="text-[var(--color-text)]">
            {order.destinationCountry}
          </strong>
          ? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="primaryOutline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    )}
  </Modal>
);
