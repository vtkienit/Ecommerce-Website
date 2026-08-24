import { useEffect, useState } from "react";
import {
  getCategories,
  getCurrentFlashSale,
  getProduct,
  getProducts,
} from "../api/catalogApi";
import type {
  Category,
  FlashSale,
  PageResponse,
  ProductDetail,
  ProductQuery,
  ProductSummary,
} from "../model/catalogTypes";

type CatalogState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Catalog request failed";

export function useCategories(): CatalogState<Category[]> {
  const [state, setState] = useState<CatalogState<Category[]>>({
    data: null,
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (active) setState({ data, isLoading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, isLoading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function useProducts(query: ProductQuery): CatalogState<PageResponse<ProductSummary>> {
  const queryKey = JSON.stringify(query);
  const [state, setState] = useState<CatalogState<PageResponse<ProductSummary>>>({
    data: null,
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;
    const currentQuery = JSON.parse(queryKey) as ProductQuery;

    getProducts(currentQuery)
      .then((data) => {
        if (active) setState({ data, isLoading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, isLoading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return state;
}

export function useProduct(slug?: string): CatalogState<ProductDetail> {
  const [state, setState] = useState<CatalogState<ProductDetail> & { slug?: string }>({
    slug,
    data: null,
    isLoading: Boolean(slug),
    error: slug ? "" : "Product not found",
  });

  useEffect(() => {
    if (!slug) return;

    let active = true;
    getProduct(slug)
      .then((data) => {
        if (active) setState({ slug, data, isLoading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (active) setState({ slug, data: null, isLoading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (state.slug !== slug) {
    return {
      data: null,
      isLoading: Boolean(slug),
      error: slug ? "" : "Product not found",
    };
  }

  return state;
}

export function useCurrentFlashSale(): CatalogState<FlashSale> {
  const [state, setState] = useState<CatalogState<FlashSale>>({
    data: null,
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getCurrentFlashSale()
      .then((data) => {
        if (active) setState({ data: data ?? null, isLoading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, isLoading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
