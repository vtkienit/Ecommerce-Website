export type AdminVariant = {
  id: number;
  sku: string;
  size: string | null;
  thickness: string | null;
  color: string | null;
  price: number;
};

export type AdminImage = {
  id: number;
  imageUrl: string;
  primary: boolean;
};

export type AdminProduct = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  variants: AdminVariant[];
  images: AdminImage[];
};

export type CategoryPayload = {
  name: string;
  slug: string;
};

export type ProductPayload = {
  categoryId: number;
  name: string;
  slug: string;
  brand: string;
  description: string;
};

export type VariantPayload = {
  sku: string;
  size: string;
  thickness: string;
  color: string;
  price: number;
};

export type ImagePayload = {
  imageUrl: string;
  primary: boolean;
};

export type AdminFlashSale = {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  productIds: number[];
  productCount: number;
  variantCount: number;
};

export type FlashSalePayload = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  productIds: number[];
};
