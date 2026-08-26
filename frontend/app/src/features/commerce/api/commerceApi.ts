import { apiRequest } from "../../../shared/api/httpClient";
import { authenticatedRequest } from "../../auth/api/authenticatedRequest";
import type { PageQuery, PageResponse } from "../../../shared/model/pagination";
import type {
  AdminDashboard,
  Cart,
  CheckoutRequest,
  InventoryItem,
  Order,
  OrderStatus,
  ReturnRequest,
  ReturnRequestStatus,
  VariantAvailability,
  Voucher,
  VoucherPayload,
  VoucherPreview,
} from "../model/commerceTypes";

const commerceRequest = <TResponse>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
) => authenticatedRequest<TResponse>(path, {
    method,
    body,
    fallbackMessage: "Commerce request failed",
  });

const publicCommerceRequest = <TResponse>(path: string) => apiRequest<TResponse>(path, {
  fallbackMessage: "Commerce request failed",
});

export const getCart = () => commerceRequest<Cart>("/api/cart");

export const getVariantAvailability = (variantIds: number[]) => {
  const params = new URLSearchParams();
  variantIds.forEach((variantId) => params.append("variantIds", String(variantId)));
  return publicCommerceRequest<VariantAvailability[]>(`/api/inventory/availability?${params}`);
};

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

export const getAdminOrders = (query: PageQuery & { status?: OrderStatus } = {}) =>
  commerceRequest<PageResponse<Order>>(`/api/admin/orders?${adminParams(query)}`);

export const getAdminDashboard = () =>
  commerceRequest<AdminDashboard>("/api/admin/dashboard");

export const updateOrderStatus = (
  orderId: number,
  status: OrderStatus,
  shippingDetails?: { shippingCarrier: string },
) => commerceRequest<Order>(`/api/admin/orders/${orderId}/status`, "PATCH", {
  status,
  ...shippingDetails,
});

export const getAdminReturnRequests = (query: PageQuery & { status?: ReturnRequestStatus } = {}) =>
  commerceRequest<PageResponse<ReturnRequest>>(`/api/admin/returns?${adminParams(query)}`);

export const updateReturnRequestStatus = (
  requestId: number,
  status: ReturnRequestStatus,
  adminNote?: string,
) => commerceRequest<ReturnRequest>(`/api/admin/returns/${requestId}/status`, "PATCH", {
  status,
  adminNote,
});

export const getInventory = (query: PageQuery = {}) =>
  commerceRequest<PageResponse<InventoryItem>>(`/api/admin/inventory?${adminParams(query)}`);

export const updateInventory = (variantId: number, onHandQuantity: number) =>
  commerceRequest<InventoryItem>(`/api/admin/inventory/${variantId}`, "PATCH", { onHandQuantity });

export const getVouchers = (query: PageQuery = {}) =>
  commerceRequest<PageResponse<Voucher>>(`/api/admin/vouchers?${adminParams(query)}`);

export const createVoucher = (request: VoucherPayload) =>
  commerceRequest<Voucher>("/api/admin/vouchers", "POST", request);

export const updateVoucher = (id: number, request: VoucherPayload) =>
  commerceRequest<Voucher>(`/api/admin/vouchers/${id}`, "PATCH", request);

export const deleteVoucher = (id: number) =>
  commerceRequest<void>(`/api/admin/vouchers/${id}`, "DELETE");

function adminParams(query: PageQuery & { status?: string }) {
  const params = new URLSearchParams({
    page: String(query.page ?? 0),
    size: String(query.size ?? 8),
  });
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status) params.set("status", query.status);
  return params.toString();
}
