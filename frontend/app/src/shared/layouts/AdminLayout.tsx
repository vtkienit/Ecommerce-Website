import { useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  Globe2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  TicketPercent,
  Undo2,
  UserRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../../app/contexts/LanguageContext";
import { clearAuthSession, getStoredUser } from "../../features/auth/model/authSession";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  { to: "/admin/catalog", label: "catalogManagement", icon: Package },
  { to: "/admin/inventory", label: "inventoryManagement", icon: Boxes },
  { to: "/admin/orders", label: "orderManagement", icon: ClipboardList },
  { to: "/admin/vouchers", label: "voucherManagement", icon: TicketPercent },
  { to: "/admin/returns", label: "returnManagement", icon: Undo2 },
] as const;

export default function AdminLayout() {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (user.role.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-subtle text-text">
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t("close")}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-bg shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex h-20 items-center justify-between border-b border-border px-6">
          <NavLink to="/admin/catalog" className="flex items-center gap-3 text-text no-underline">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <LayoutDashboard size={21} aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-lg leading-tight">QuyDung</strong>
              <small className="font-medium uppercase tracking-[0.16em] text-primary">Admin</small>
            </span>
          </NavLink>
          <button type="button" className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={21} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
            {t("adminNavigation")}
          </p>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold no-underline transition-colors",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-primary",
              )}
            >
              <Icon size={19} aria-hidden="true" />
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-4">
          <NavLink to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-secondary no-underline hover:bg-bg-secondary hover:text-primary">
            <Home size={19} aria-hidden="true" />
            {t("backToStore")}
          </NavLink>
          <NavLink to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-text-secondary no-underline hover:bg-bg-secondary hover:text-primary">
            <UserRound size={19} aria-hidden="true" />
            {t("profile")}
          </NavLink>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">
            <LogOut size={19} aria-hidden="true" />
            {t("logout")}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" className="rounded-lg p-2 text-text-secondary hover:bg-bg-secondary lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} aria-hidden="true" />
          </button>
          <p className="hidden text-sm text-text-secondary sm:block">{t("adminWorkspace")}</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="group relative">
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                aria-label={lang === "vi" ? t("vietnamese") : t("english")}
                aria-haspopup="menu"
              >
                <Globe2 size={18} aria-hidden="true" />
                <span className="hidden md:inline">
                  {lang === "vi" ? t("vietnamese") : t("english")}
                </span>
                <ChevronDown
                  size={15}
                  className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                  aria-hidden="true"
                />
              </button>

              <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div role="menu" className="w-36 overflow-hidden rounded-xl border border-border bg-bg p-1.5 shadow-xl">
                  <button
                    type="button"
                    role="menuitem"
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary",
                      lang === "vi" && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setLang("vi")}
                  >
                    {t("vietnamese")}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary",
                      lang === "en" && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setLang("en")}
                  >
                    {t("english")}
                  </button>
                </div>
              </div>
            </div>
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-text">{user.name}</p>
              <p className="text-xs text-text-tertiary">Administrator</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-semibold text-white">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
