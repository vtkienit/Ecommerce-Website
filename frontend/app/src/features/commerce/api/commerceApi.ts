import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import { getAuthToken } from "../../auth/model/authSession";
import type {
  Cart,
  CheckoutRequest,
  InventoryItem,
  Order,
  OrderStatus,
  ReturnRequest,
  ReturnRequestStatus,
  Voucher,
  VoucherPayload,
  VoucherPreview,
} from "../model/commerceTypes";

const commerceApiUrl = (
  import.meta.env.VITE_COMMERCE_API_URL || "http://localhost:8082"
).replace(/\/$/, "");

const commerceRequest = <TResponse>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
) => {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError("Authentication is required", 401);
  }

  return apiRequest<TResponse>(path, {
    baseUrl: commerceApiUrl,
    method,
    body,
    token,
    fallbackMessage: "Commerce request failed",
  });
};

export const getCart = () => commerceRequest<Cart>("/api/cart");

export const addCartItem = (variantId: number, quantity: number) =>
  commerceRequest<Cart>("/api/cart/items", "POST", { variantId, quantity });

export const updateCartItem = (itemId: number, quantity: number) =>
  commerceRequest<Cart>(`/api/cart/items/${itemId}`, "PATCH", { quantity });

export const removeCartItem = (itemId: number) =>
  commerceRequest<Cart>(`/api/cart/items/${itemId}`, "DELETE");

export const checkout = (request: CheckoutRequest) =>
  commerceRequest<Order>("/api/orders/checkout", "POST", request);

export const previewVoucher = (code: string) =>
  commerceRequest<VoucherPreview>("/api/vouchers/preview", "POST", { code });

export const getOrders = () => commerceRequest<Order[]>("/api/orders");

export const cancelOrder = (orderId: number) =>
  commerceRequest<Order>(`/api/orders/${orderId}/cancel`, "PATCH");

export const createReturnRequest = (orderId: number, reason: string) =>
  commerceRequest<ReturnRequest>(`/api/orders/${orderId}/returns`, "POST", { reason });

export const syncOrderPayment = (orderId: number) =>
  commerceRequest<Order>(`/api/orders/${orderId}/payment/sync`, "POST");

export const getAdminOrders = (status?: OrderStatus) =>
  commerceRequest<Order[]>(`/api/admin/orders${status ? `?status=${status}` : ""}`);

export const updateOrderStatus = (orderId: number, status: OrderStatus) =>
  commerceRequest<Order>(`/api/admin/orders/${orderId}/status`, "PATCH", { status });

export const getAdminReturnRequests = (status?: ReturnRequestStatus) =>
  commerceRequest<ReturnRequest[]>(`/api/admin/returns${status ? `?status=${status}` : ""}`);

export const updateReturnRequestStatus = (
  requestId: number,
  status: ReturnRequestStatus,
  adminNote?: string,
) => commerceRequest<ReturnRequest>(`/api/admin/returns/${requestId}/status`, "PATCH", {
  status,
  adminNote,
});

export const getInventory = () =>
  commerceRequest<InventoryItem[]>("/api/admin/inventory");

export const syncInventory = () =>
  commerceRequest<InventoryItem[]>("/api/admin/inventory/sync", "POST");

export const updateInventory = (variantId: number, onHandQuantity: number) =>
  commerceRequest<InventoryItem>(`/api/admin/inventory/${variantId}`, "PATCH", { onHandQuantity });

export const getVouchers = () =>
  commerceRequest<Voucher[]>("/api/admin/vouchers");

export const createVoucher = (request: VoucherPayload) =>
  commerceRequest<Voucher>("/api/admin/vouchers", "POST", request);

export const updateVoucher = (id: number, request: VoucherPayload) =>
  commerceRequest<Voucher>(`/api/admin/vouchers/${id}`, "PATCH", request);

export const deleteVoucher = (id: number) =>
  commerceRequest<void>(`/api/admin/vouchers/${id}`, "DELETE");
