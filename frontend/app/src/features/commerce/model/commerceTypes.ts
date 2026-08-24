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
  paymentMethod: PaymentMethod;
};

export type PaymentMethod = "COD" | "PAYOS";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

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
  userId: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  checkoutUrl: string | null;
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
