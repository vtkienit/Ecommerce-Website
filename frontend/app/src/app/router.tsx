import { Route, Routes } from "react-router-dom";
import AccountPage from "../pages/AccountPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MattressPage from "../pages/MattressPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import InventoryAdminPage from "../pages/InventoryAdminPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mattress" element={<MattressPage />} />
      <Route path="/catalog/:categorySlug" element={<MattressPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin/inventory" element={<InventoryAdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<AccountPage />} />
      <Route path="/profile/address" element={<AccountPage section="address" />} />
      <Route path="/purchases" element={<AccountPage section="purchases" />} />
    </Routes>
  );
}
