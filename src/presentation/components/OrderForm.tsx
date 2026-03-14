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
    () => initialValues?.shippingDate ?? defaultValues.shippingDate,
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
        placeholder={{ value: "", label: "Select country" }}
        wrapperClassName="space-y-1"
        labelClassName="mb-1 block text-sm font-medium text-slate-600"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors focus:outline-none focus:ring-1 focus:border-emerald-500 focus:ring-emerald-500"
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

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button
          type="button"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border border-slate-300 text-slate-700 hover:bg-slate-100"
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
