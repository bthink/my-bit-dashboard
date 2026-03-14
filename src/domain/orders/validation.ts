import {createOrderValidationError} from "./errors";
import type {CreateOrderInput, UpdateOrderInput} from "./order";
import {isAllowedDestinationCountry} from "./countries";

type OrderInput = CreateOrderInput | UpdateOrderInput;

const MAX_DESTINATION_COUNTRY_LENGTH = 200;
const MAX_PRICE = 999_999_999.99;

type ValidateOrderOptions = {
  allowLegacyCountry?: string;
};

const normalizeOrderInput = (input: OrderInput): OrderInput => ({
  destinationCountry: input.destinationCountry.trim(),
  shippingDate: normalizeDateInput(input.shippingDate),
  price: Number.isFinite(input.price) ? input.price : Number(input.price),
});

const validateOrderInput = (
  input: OrderInput,
  options?: ValidateOrderOptions,
): void => {
  const fieldErrors: Record<string, string> = {};

  const country = input.destinationCountry.trim();
  if (!country) {
    fieldErrors.destinationCountry = "Destination country is required.";
  } else if (country.length > MAX_DESTINATION_COUNTRY_LENGTH) {
    fieldErrors.destinationCountry = `Destination country must be at most ${MAX_DESTINATION_COUNTRY_LENGTH} characters.`;
  } else if (
    !isAllowedDestinationCountry(country) &&
    country !== options?.allowLegacyCountry
  ) {
    fieldErrors.destinationCountry =
      "Destination country must be one of the allowed countries.";
  }

  if (!isValidIsoDate(input.shippingDate)) {
    fieldErrors.shippingDate =
      "Shipping date must be a valid date (YYYY-MM-DD).";
  }

  if (!Number.isFinite(input.price) || input.price <= 0) {
    fieldErrors.price = "Price must be a number greater than 0.";
  } else if (input.price > MAX_PRICE) {
    fieldErrors.price = `Price must not exceed ${MAX_PRICE.toLocaleString()}.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw createOrderValidationError("Invalid order input.", fieldErrors);
  }
};

const normalizeDateInput = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}` === value;
};

export {
  type ValidateOrderOptions,
  normalizeOrderInput,
  validateOrderInput,
  normalizeDateInput,
  isValidIsoDate,
};
