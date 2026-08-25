import type { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import CartProvider from "../features/commerce/context/CartProvider";
import RealtimeNotificationProvider from "../features/notifications/context/RealtimeNotificationProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <RealtimeNotificationProvider>
            <CartProvider>{children}</CartProvider>
          </RealtimeNotificationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
