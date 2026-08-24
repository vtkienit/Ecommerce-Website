import type { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import CartProvider from "../features/commerce/context/CartProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
