import { apiRequest } from "../../../shared/api/httpClient";
import type {
  Category,
  FlashSale,
  PageResponse,
  ProductDetail,
  ProductQuery,
  ProductSummary,
} from "../model/catalogTypes";

const catalogApiUrl = (
  import.meta.env.VITE_CATALOG_API_URL || "http://localhost:8081"
).replace(/\/$/, "");

const catalogRequest = <TResponse>(path: string) =>
  apiRequest<TResponse>(path, {
    baseUrl: catalogApiUrl,
    fallbackMessage: "Catalog request failed",
  });

export const getCategories = () =>
  catalogRequest<Category[]>("/api/categories");

export const getProducts = (query: ProductQuery = {}) => {
  const params = new URLSearchParams();

  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.sort) params.set("sort", query.sort);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  query.sizes?.forEach((size) => params.append("variantSize", size));
  query.colors?.forEach((color) => params.append("color", color));

  const search = params.toString();
  return catalogRequest<PageResponse<ProductSummary>>(
    `/api/products${search ? `?${search}` : ""}`,
  );
};

export const getProduct = (slug: string) =>
  catalogRequest<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);

export const getCurrentFlashSale = () =>
  catalogRequest<FlashSale | null>("/api/flash-sales/current");
