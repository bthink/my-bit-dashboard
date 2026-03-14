export type OrderId = string;

export type Order = {
  id: OrderId;
  destinationCountry: string;
  shippingDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  destinationCountry: string;
  shippingDate: string;
  price: number;
};

export type UpdateOrderInput = {
  destinationCountry: string;
  shippingDate: string;
  price: number;
};
