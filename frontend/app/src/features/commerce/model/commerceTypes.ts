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
  voucherCode?: string;
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

export type ReturnRequestStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";

export type ReturnRequest = {
  id: number;
  orderId: number;
  orderNumber: string;
  userId: number;
  reason: string;
  status: ReturnRequestStatus;
  adminNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  items: OrderItem[];
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  subtotal: number;
  voucherCode: string | null;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  checkoutUrl: string | null;
  returnEligible: boolean;
  returnRequest: ReturnRequest | null;
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

export type VariantAvailability = {
  variantId: number;
  availableQuantity: number;
};

export type DashboardOrder = {
  id: number;
  orderNumber: string;
  recipientName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type DashboardLowStockItem = {
  variantId: number;
  sku: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

export type AdminDashboard = {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockVariants: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: DashboardOrder[];
  lowStockItems: DashboardLowStockItem[];
};

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type Voucher = {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  quantity: number;
  usedCount: number;
  remainingQuantity: number;
  startDate: string;
  endDate: string;
  active: boolean;
};

export type VoucherPayload = {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  quantity: number;
  startDate: string;
  endDate: string;
};

export type VoucherPreview = {
  code: string;
  description: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
};
