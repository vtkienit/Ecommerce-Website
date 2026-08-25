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

type ProductCatalogState = CatalogState<PageResponse<ProductSummary>> & {
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

type ProductPageState = CatalogState<PageResponse<ProductSummary>> & {
  queryKey: string;
  isLoadingMore: boolean;
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

export function useProducts(query: ProductQuery): ProductCatalogState {
  const { page: initialPage = 0, ...filters } = query;
  const queryKey = JSON.stringify(filters);
  const [request, setRequest] = useState({ queryKey, page: initialPage });
  const [state, setState] = useState<ProductPageState>({
    queryKey,
    data: null,
    isLoading: true,
    isLoadingMore: false,
    error: "",
  });
  const requestedPage = request.queryKey === queryKey ? request.page : initialPage;

  useEffect(() => {
    let active = true;
    const currentQuery = JSON.parse(queryKey) as Omit<ProductQuery, "page">;

    getProducts({ ...currentQuery, page: requestedPage })
      .then((page) => {
        if (!active) return;

        setState((current) => {
          const previousProducts = requestedPage > initialPage && current.queryKey === queryKey
            ? current.data?.content ?? []
            : [];

          return {
            queryKey,
            data: { ...page, content: [...previousProducts, ...page.content] },
            isLoading: false,
            isLoadingMore: false,
            error: "",
          };
        });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState((current) => ({
          queryKey,
          data: current.queryKey === queryKey ? current.data : null,
          isLoading: false,
          isLoadingMore: false,
          error: getErrorMessage(error),
        }));
      });

    return () => {
      active = false;
    };
  }, [initialPage, queryKey, requestedPage]);

  const currentState = state.queryKey === queryKey
    ? state
    : { data: null, isLoading: true, isLoadingMore: false, error: "" };

  const loadMore = () => {
    if (!currentState.data || currentState.data.last || currentState.isLoadingMore) return;
    setState((current) => ({ ...current, isLoadingMore: true, error: "" }));
    setRequest({ queryKey, page: currentState.data.page + 1 });
  };

  return {
    data: currentState.data,
    isLoading: currentState.isLoading,
    isLoadingMore: currentState.isLoadingMore,
    error: currentState.error,
    hasMore: Boolean(currentState.data && !currentState.data.last),
    loadMore,
  };
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
