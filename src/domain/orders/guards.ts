import type {Order} from "./order";

export const isOrderLike = (value: unknown): value is Order => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.destinationCountry === "string" &&
    typeof record.shippingDate === "string" &&
    typeof record.price === "number" &&
    Number.isFinite(record.price) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
};
