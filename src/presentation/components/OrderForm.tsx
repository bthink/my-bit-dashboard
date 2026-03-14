import {useState, useCallback, useMemo} from "react";
import type {CreateOrderInput} from "../../domain/orders/order";
import type {OrderFieldErrors} from "../../domain/orders/errors";
import {
  DESTINATION_COUNTRIES,
  isAllowedDestinationCountry,
} from "../../domain/orders/countries";
import {Button} from "./Button";
import {DateInput} from "./DateInput";
import {NumberInput} from "./NumberInput";
import {Select} from "./Select";

type OrderFormProps = {
  initialValues?: CreateOrderInput;
  onSubmit: (values: CreateOrderInput) => Promise<void>;
  onCancel: () => void;
  fieldErrors?: OrderFieldErrors | null;
  isSubmitting: boolean;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultValues: CreateOrderInput = {
  destinationCountry: "",
  shippingDate: "",
  price: 0,
};

export const OrderForm = ({
  initialValues,
  onSubmit,
  onCancel,
  fieldErrors = null,
  isSubmitting,
}: OrderFormProps) => {
  const [destinationCountry, setDestinationCountry] = useState(
    () => initialValues?.destinationCountry ?? defaultValues.destinationCountry,
  );
  const [shippingDate, setShippingDate] = useState(
    () => initialValues?.shippingDate ?? todayIso(),
  );
  const [price, setPrice] = useState<string>(() =>
    initialValues?.price !== undefined && initialValues.price !== 0
      ? String(initialValues.price)
      : "",
  );

  const countryOptions = useMemo(() => {
    const initial = initialValues?.destinationCountry?.trim();
    const legacy = initial && !isAllowedDestinationCountry(initial);
    if (!legacy) return DESTINATION_COUNTRIES;
    return [initial, ...DESTINATION_COUNTRIES];
  }, [initialValues?.destinationCountry]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const priceNum = price.trim() === "" ? 0 : Number(price);
      await onSubmit({
        destinationCountry: destinationCountry.trim(),
        shippingDate: shippingDate.trim(),
        price: priceNum,
      });
    },
    [destinationCountry, shippingDate, price, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="order-form-country"
        label="Destination country"
        value={destinationCountry}
        onChange={setDestinationCountry}
        options={countryOptions}
        placeholder={{value: "", label: "Select country"}}
        wrapperClassName="space-y-1"
        labelClassName="mb-1 block text-sm font-medium text-[var(--color-text-muted)]"
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        error={fieldErrors?.destinationCountry ?? null}
      />

      <DateInput
        id="order-form-date"
        label="Shipping date"
        value={shippingDate}
        onChange={setShippingDate}
        error={fieldErrors?.shippingDate ?? null}
      />

      <NumberInput
        id="order-form-price"
        label="Price"
        value={price}
        onChange={setPrice}
        error={fieldErrors?.price ?? null}
        min={0}
        step="any"
        placeholder="0.00"
      />

      <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
        <Button
          type="button"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving…"
            : initialValues
              ? "Update order"
              : "Create order"}
        </Button>
      </div>
    </form>
  );
};
