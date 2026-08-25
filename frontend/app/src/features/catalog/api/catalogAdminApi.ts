import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import { getAuthToken } from "../../auth/model/authSession";
import type { Category } from "../model/catalogTypes";
import type {
  AdminProduct,
  CategoryPayload,
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

export const getAdminProducts = () =>
  adminRequest<AdminProduct[]>("/api/admin/catalog/products");

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
