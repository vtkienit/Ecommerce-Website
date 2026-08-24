export type CartItem = {
  id: number;
  variantId: number;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  sku: string;
  size: string | null;
  thickness: string | null;
  color: string | null;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
  lineTotal: number;
};

export type Cart = {
  id: number | null;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
};

export type CheckoutRequest = {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: "COD";
};

export type OrderItem = {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Order = {
  id: number;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string | null;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | null;
  createdAt: string;
  items: OrderItem[];
};

export type InventoryItem = {
  id: number | null;
  variantId: number;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  sku: string;
  size: string | null;
  thickness: string | null;
  color: string | null;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};
