import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import { getAuthToken } from "../../auth/model/authSession";
import type { Cart, CheckoutRequest, InventoryItem, Order } from "../model/commerceTypes";

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

export const getOrders = () => commerceRequest<Order[]>("/api/orders");

export const cancelOrder = (orderId: number) =>
  commerceRequest<Order>(`/api/orders/${orderId}/cancel`, "PATCH");

export const getInventory = () =>
  commerceRequest<InventoryItem[]>("/api/admin/inventory");

export const syncInventory = () =>
  commerceRequest<InventoryItem[]>("/api/admin/inventory/sync", "POST");

export const updateInventory = (variantId: number, onHandQuantity: number) =>
  commerceRequest<InventoryItem>(`/api/admin/inventory/${variantId}`, "PATCH", { onHandQuantity });
