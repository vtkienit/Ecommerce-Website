export type Category = {
  id: number;
  slug: string;
  name: string;
  productCount: number;
};

export type ProductSummary = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  categorySlug: string;
  categoryName: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  numberSizes: number;
  numberColors: number;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  primary: boolean;
};

export type ProductVariant = {
  id: number;
  sku: string;
  size: string | null;
  thickness: string | null;
  color: string | null;
  originalPrice: number;
  price: number;
  discountPercentage: number | null;
};

export type ProductDetail = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  relatedProducts: ProductSummary[];
};

export type FlashSale = {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  products: ProductSummary[];
};

export type { PageResponse } from "../../../shared/model/pagination";

export type ProductQuery = {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: "newest,desc" | "name,asc" | "name,desc" | "price,asc" | "price,desc";
  page?: number;
  size?: number;
};
