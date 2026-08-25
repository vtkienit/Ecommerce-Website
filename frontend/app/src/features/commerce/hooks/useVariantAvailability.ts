import { useEffect, useState } from "react";
import { getVariantAvailability } from "../api/commerceApi";

type VariantAvailabilityState = {
  quantities: Record<number, number>;
  isLoading: boolean;
  error: string;
};

export function useVariantAvailability(variantIds: number[]): VariantAvailabilityState {
  const queryKey = [...new Set(variantIds)].sort((left, right) => left - right).join(",");
  const [state, setState] = useState<VariantAvailabilityState & { queryKey: string }>({
    queryKey,
    quantities: {},
    isLoading: Boolean(queryKey),
    error: "",
  });

  useEffect(() => {
    if (!queryKey) return;

    let active = true;
    const ids = queryKey.split(",").map(Number);
    getVariantAvailability(ids)
      .then((availability) => {
        if (!active) return;
        setState({
          queryKey,
          quantities: Object.fromEntries(
            availability.map((item) => [item.variantId, item.availableQuantity]),
          ),
          isLoading: false,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          queryKey,
          quantities: {},
          isLoading: false,
          error: error instanceof Error ? error.message : "Inventory request failed",
        });
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  if (state.queryKey !== queryKey) {
    return { quantities: {}, isLoading: Boolean(queryKey), error: "" };
  }

  return state;
}
