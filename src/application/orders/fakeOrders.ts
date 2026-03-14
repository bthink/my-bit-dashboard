import type {Order} from "@/domain/orders/order";
import {DESTINATION_COUNTRIES} from "@/domain/orders/countries";

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomItem = <T>(arr: readonly T[]): T => {
  const index = randomInt(0, Math.max(0, arr.length - 1));
  return arr[index] as T;
};

const randomDate = (startYear: number, endYear: number): string => {
  const year = randomInt(startYear, endYear);
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const nowIso = (): string => {
  return new Date().toISOString();
};

export const generateFakeOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  const now = nowIso();
  const currentYear = new Date().getFullYear();

  const base = Date.now();
  for (let i = 0; i < count; i++) {
    orders.push({
      id: `${base.toString(36)}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      destinationCountry: randomItem(DESTINATION_COUNTRIES),
      shippingDate: randomDate(currentYear - 1, currentYear + 1),
      price: Math.round((randomInt(10, 5000) + Math.random()) * 100) / 100,
      createdAt: now,
      updatedAt: now,
    });
  }

  return orders;
};
