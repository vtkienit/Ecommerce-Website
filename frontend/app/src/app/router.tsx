import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../shared/layouts/AdminLayout";
import AccountPage from "../pages/AccountPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MattressPage from "../pages/MattressPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import PaymentResultPage from "../pages/PaymentResultPage";
import ContactPage from "../pages/ContactPage";
import SupportPage from "../pages/SupportPage";

const CatalogAdminPage = lazy(() => import("../pages/CatalogAdminPage"));
const DashboardAdminPage = lazy(() => import("../pages/DashboardAdminPage"));
const FlashSaleAdminPage = lazy(() => import("../pages/FlashSaleAdminPage"));
const InventoryAdminPage = lazy(() => import("../pages/InventoryAdminPage"));
const OrderAdminPage = lazy(() => import("../pages/OrderAdminPage"));
const VoucherAdminPage = lazy(() => import("../pages/VoucherAdminPage"));
const ReturnAdminPage = lazy(() => import("../pages/ReturnAdminPage"));

const adminPage = (page: ReactNode) => (
  <Suspense fallback={<div className="min-h-screen bg-bg" />}>
    {page}
  </Suspense>
);

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mattress" element={<MattressPage />} />
      <Route path="/catalog/:categorySlug" element={<MattressPage />} />
      <Route path="/bedding" element={<Navigate to="/catalog/bedding-sets" replace />} />
      <Route path="/accessories" element={<Navigate to="/catalog/blankets" replace />} />
      <Route path="/accessories/blanket" element={<Navigate to="/catalog/blankets" replace />} />
      <Route path="/accessories/bed-sheet" element={<Navigate to="/catalog/bed-sheets" replace />} />
      <Route path="/accessories/pillow" element={<Navigate to="/catalog/pillows" replace />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/payment/success" element={<PaymentResultPage mode="success" />} />
      <Route path="/payment/cancel" element={<PaymentResultPage mode="cancel" />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={adminPage(<DashboardAdminPage />)} />
        <Route path="catalog" element={adminPage(<CatalogAdminPage />)} />
        <Route path="flash-sales" element={adminPage(<FlashSaleAdminPage />)} />
        <Route path="inventory" element={adminPage(<InventoryAdminPage />)} />
        <Route path="orders" element={adminPage(<OrderAdminPage />)} />
        <Route path="vouchers" element={adminPage(<VoucherAdminPage />)} />
        <Route path="returns" element={adminPage(<ReturnAdminPage />)} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<AccountPage />} />
      <Route path="/profile/address" element={<AccountPage section="address" />} />
      <Route path="/purchases" element={<AccountPage section="purchases" />} />
      <Route path="/purchases/pending" element={<AccountPage section="purchases" purchaseFilter="pending" />} />
      <Route path="/purchases/awaiting-shipment" element={<AccountPage section="purchases" purchaseFilter="awaiting-shipment" />} />
      <Route path="/purchases/shipping" element={<AccountPage section="purchases" purchaseFilter="shipping" />} />
      <Route path="/purchases/completed" element={<AccountPage section="purchases" purchaseFilter="completed" />} />
      <Route path="/purchases/cancelled" element={<AccountPage section="purchases" purchaseFilter="cancelled" />} />
      <Route path="/purchases/returns" element={<AccountPage section="purchases" purchaseFilter="returns" />} />
    </Routes>
  );
}
