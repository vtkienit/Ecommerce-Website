import { createContext, useContext } from "react";
import type { Cart } from "../model/commerceTypes";

export type CartContextValue = {
  cart: Cart;
  isLoading: boolean;
  error: string;
  refreshCart: () => Promise<void>;
  addItem: (variantId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
};

export const emptyCart: Cart = {
  id: null,
  items: [],
  totalQuantity: 0,
  subtotal: 0,
};

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
