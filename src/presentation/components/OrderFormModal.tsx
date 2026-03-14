import {Modal} from "./Modal";
import {OrderForm} from "./OrderForm";
import type {CreateOrderInput} from "../../domain/orders/order";
import type {OrderFieldErrors} from "../../domain/orders/errors";

type OrderFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formKey: string;
  initialValues?: CreateOrderInput;
  onSubmit: (values: CreateOrderInput) => Promise<void>;
  fieldErrors?: OrderFieldErrors | null;
  isSubmitting: boolean;
};

export const OrderFormModal = ({
  isOpen,
  onClose,
  title,
  formKey,
  initialValues,
  onSubmit,
  fieldErrors,
  isSubmitting,
}: OrderFormModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <OrderForm
      key={formKey}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onClose}
      fieldErrors={fieldErrors}
      isSubmitting={isSubmitting}
    />
  </Modal>
);
