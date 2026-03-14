import {useState, useCallback, useMemo} from "react";
import type {CreateOrderInput} from "../../domain/orders/order";
import type {OrderFieldErrors} from "../../domain/orders/errors";
import {
  DESTINATION_COUNTRIES,
  isAllowedDestinationCountry,
} from "../../domain/orders/countries";
import {Button} from "./Button";

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
      <div>
        <label
          htmlFor="order-form-country"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Destination country
        </label>
        <select
          id="order-form-country"
          value={destinationCountry}
          onChange={(e) => setDestinationCountry(e.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 transition-colors focus:outline-none focus:ring-1 ${
            fieldErrors?.destinationCountry
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
          }`}
          aria-invalid={Boolean(fieldErrors?.destinationCountry)}
          aria-describedby={
            fieldErrors?.destinationCountry ? "country-error" : undefined
          }
        >
          <option value="">Select country</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {fieldErrors?.destinationCountry && (
          <p
            id="country-error"
            className="mt-1 text-sm text-rose-600"
            role="alert"
          >
            {fieldErrors.destinationCountry}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="order-form-date"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Shipping date
        </label>
        <input
          id="order-form-date"
          type="date"
          value={shippingDate}
          onChange={(e) => setShippingDate(e.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 transition-colors focus:outline-none focus:ring-1 ${
            fieldErrors?.shippingDate
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
          }`}
          aria-invalid={Boolean(fieldErrors?.shippingDate)}
          aria-describedby={
            fieldErrors?.shippingDate ? "date-error" : undefined
          }
        />
        {fieldErrors?.shippingDate && (
          <p
            id="date-error"
            className="mt-1 text-sm text-rose-600"
            role="alert"
          >
            {fieldErrors.shippingDate}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="order-form-price"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Price
        </label>
        <input
          id="order-form-price"
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 ${
            fieldErrors?.price
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
          }`}
          placeholder="0.00"
          aria-invalid={Boolean(fieldErrors?.price)}
          aria-describedby={fieldErrors?.price ? "price-error" : undefined}
        />
        {fieldErrors?.price && (
          <p
            id="price-error"
            className="mt-1 text-sm text-rose-600"
            role="alert"
          >
            {fieldErrors.price}
          </p>
        )}
      </div>

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
