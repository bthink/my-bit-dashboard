import type {Order} from "./order";

type OrderMetrics = {
  totalOrders: number;
  totalPrice: number;
  uniqueCountries: number;
};

const calculateOrderMetrics = (orders: readonly Order[]): OrderMetrics => {
  const countries = new Set<string>();

  let totalPrice = 0;
  for (const order of orders) {
    countries.add(order.destinationCountry);
    totalPrice += order.price;
  }

  return {
    totalOrders: orders.length,
    totalPrice,
    uniqueCountries: countries.size,
  };
};

type OrderCountByCountry = {country: string; count: number};

const getOrderCountByCountry = (
  orders: readonly Order[],
): OrderCountByCountry[] => {
  const byCountry = new Map<string, number>();
  for (const order of orders) {
    const c = order.destinationCountry;
    byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
  }
  return Array.from(byCountry.entries())
    .map(([country, count]) => ({country, count}))
    .sort((a, b) => b.count - a.count);
};

type OrderCountByDate = {date: string; count: number};

const getOrderCountByDate = (orders: readonly Order[]): OrderCountByDate[] => {
  const byDate = new Map<string, number>();
  for (const order of orders) {
    const d = order.shippingDate;
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .map(([date, count]) => ({date, count}))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export {calculateOrderMetrics, getOrderCountByCountry, getOrderCountByDate};
