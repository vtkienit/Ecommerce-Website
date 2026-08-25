import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import { getAuthToken } from "../../auth/model/authSession";
import type { PageQuery, PageResponse } from "../../../shared/model/pagination";
import type { Category } from "../model/catalogTypes";
import type {
  AdminProduct,
  AdminFlashSale,
  CategoryPayload,
  FlashSalePayload,
  ImagePayload,
  ProductPayload,
  VariantPayload,
} from "../model/catalogAdminTypes";

const catalogApiUrl = (
  import.meta.env.VITE_CATALOG_API_URL || "http://localhost:8081"
).replace(/\/$/, "");

const adminRequest = <TResponse>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
) => {
  const token = getAuthToken();
  if (!token) throw new ApiError("Authentication is required", 401);

  return apiRequest<TResponse>(path, {
    baseUrl: catalogApiUrl,
    method,
    body,
    token,
    fallbackMessage: "Catalog administration request failed",
  });
};

export const getAdminCategories = () =>
  adminRequest<Category[]>("/api/admin/catalog/categories");

export const createCategory = (payload: CategoryPayload) =>
  adminRequest<Category>("/api/admin/catalog/categories", "POST", payload);

export const updateCategory = (id: number, payload: CategoryPayload) =>
  adminRequest<Category>(`/api/admin/catalog/categories/${id}`, "PATCH", payload);

export const deleteCategory = (id: number) =>
  adminRequest<void>(`/api/admin/catalog/categories/${id}`, "DELETE");

export const getAdminProducts = ({ page = 0, size = 8, search = "" }: PageQuery = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search.trim()) params.set("search", search.trim());
  return adminRequest<PageResponse<AdminProduct>>(`/api/admin/catalog/products?${params}`);
};

export const createProduct = (payload: ProductPayload) =>
  adminRequest<AdminProduct>("/api/admin/catalog/products", "POST", payload);

export const updateProduct = (id: number, payload: ProductPayload) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/products/${id}`, "PATCH", payload);

export const deleteProduct = (id: number) =>
  adminRequest<void>(`/api/admin/catalog/products/${id}`, "DELETE");

export const createVariant = (productId: number, payload: VariantPayload) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/products/${productId}/variants`, "POST", payload);

export const updateVariant = (id: number, payload: VariantPayload) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/variants/${id}`, "PATCH", payload);

export const deleteVariant = (id: number) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/variants/${id}`, "DELETE");

export const uploadImages = (
  productId: number,
  primaryImage: File | null,
  secondaryImages: File[],
) => {
  const formData = new FormData();
  if (primaryImage) formData.append("primaryImage", primaryImage);
  secondaryImages.forEach((image) => formData.append("secondaryImages", image));

  return adminRequest<AdminProduct>(
    `/api/admin/catalog/products/${productId}/images/upload`,
    "POST",
    formData,
  );
};

export const updateImage = (id: number, payload: ImagePayload) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/images/${id}`, "PATCH", payload);

export const deleteImage = (id: number) =>
  adminRequest<AdminProduct>(`/api/admin/catalog/images/${id}`, "DELETE");

export const getFlashSales = ({ page = 0, size = 6 }: PageQuery = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return adminRequest<PageResponse<AdminFlashSale>>(`/api/admin/catalog/flash-sales?${params}`);
};

export const createFlashSale = (payload: FlashSalePayload) =>
  adminRequest<AdminFlashSale>("/api/admin/catalog/flash-sales", "POST", payload);

export const updateFlashSale = (id: number, payload: FlashSalePayload) =>
  adminRequest<AdminFlashSale>(`/api/admin/catalog/flash-sales/${id}`, "PATCH", payload);

export const deleteFlashSale = (id: number) =>
  adminRequest<void>(`/api/admin/catalog/flash-sales/${id}`, "DELETE");
