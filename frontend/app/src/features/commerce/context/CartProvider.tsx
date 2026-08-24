import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getAuthToken, onAuthChange } from "../../auth/model/authSession";
import { addCartItem, getCart, removeCartItem, updateCartItem } from "../api/commerceApi";
import type { Cart } from "../model/commerceTypes";
import { CartContext, emptyCart } from "./CartContext";

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    if (!getAuthToken()) {
      setCart(emptyCart);
      setError("");
      return;
    }

    setIsLoading(true);
    try {
      setCart(await getCart());
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Cannot load cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refreshCart(), 0);
    const syncCart = () => void refreshCart();
    const removeAuthListener = onAuthChange(syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.clearTimeout(initialLoad);
      removeAuthListener();
      window.removeEventListener("storage", syncCart);
    };
  }, [refreshCart]);

  const addItem = async (variantId: number, quantity: number) => {
    setCart(await addCartItem(variantId, quantity));
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setCart(await updateCartItem(itemId, quantity));
  };

  const removeItem = async (itemId: number) => {
    setCart(await removeCartItem(itemId));
  };

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      error,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
    }}>
      {children}
    </CartContext.Provider>
  );
}
