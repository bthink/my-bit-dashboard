type OrderFieldErrors = Partial<
  Record<"destinationCountry" | "shippingDate" | "price", string>
>;

type OrderValidationError = Error & {
  name: "OrderValidationError";
  fieldErrors: OrderFieldErrors;
};

type OrderNotFoundError = Error & {
  name: "OrderNotFoundError";
};

const createOrderValidationError = (
  message: string,
  fieldErrors: OrderFieldErrors,
): OrderValidationError => {
  const err = new Error(message) as OrderValidationError;
  err.name = "OrderValidationError";
  err.fieldErrors = fieldErrors;
  return err;
};

const createOrderNotFoundError = (message: string): OrderNotFoundError => {
  const err = new Error(message) as OrderNotFoundError;
  err.name = "OrderNotFoundError";
  return err;
};

const isOrderValidationError = (e: unknown): e is OrderValidationError =>
  e instanceof Error && e.name === "OrderValidationError";

const isOrderNotFoundError = (e: unknown): e is OrderNotFoundError =>
  e instanceof Error && e.name === "OrderNotFoundError";

export {
  type OrderFieldErrors,
  type OrderValidationError,
  type OrderNotFoundError,
  createOrderValidationError,
  createOrderNotFoundError,
  isOrderValidationError,
  isOrderNotFoundError,
};
