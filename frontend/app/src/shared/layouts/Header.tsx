import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import clsx from "clsx";
import Language from "../../assets/icons/language.svg?react";
import User from "../../assets/icons/user.svg?react";
import { useLanguage } from "../../app/contexts/LanguageContext";
import { useTheme } from "../../app/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { clearAuthSession, getStoredUser, onAuthChange } from "../../features/auth/model/authSession";
import { useCart } from "../../features/commerce/context/CartContext";

const desktopNavLink =
  "relative cursor-pointer py-2 text-base font-medium text-text-secondary no-underline transition-colors " +
  "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-300 after:content-[''] " +
  "hover:text-primary hover:after:w-full";

const desktopNavLinkActive = "text-primary after:w-full";
const mobileItem = "rounded p-2 transition-colors hover:bg-bg-secondary";
const mobileLink = "block w-full text-base font-medium text-text no-underline";
const mobileAccordion = "flex w-full items-center justify-between text-left text-base font-medium text-text";
const mobileSecondaryItem = "ml-2.5";

const Header = () => {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [authUser, setAuthUser] = useState(() => getStoredUser());
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItemOpen, setMenuItemOpen] = useState<Record<number, boolean>>({});
  const location = useLocation();
  const isAccessoriesActive = location.pathname.startsWith("/accessories");

  useEffect(() => {
    const syncAuthUser = () => setAuthUser(getStoredUser());
    window.addEventListener("storage", syncAuthUser);
    const removeAuthListener = onAuthChange(syncAuthUser);

    return () => {
      window.removeEventListener("storage", syncAuthUser);
      removeAuthListener();
    };
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const closeAccountMenu = () => setAccountMenuOpen(false);

  const handleLogout = () => {
    clearAuthSession();
    setAuthUser(null);
    closeAccountMenu();
    closeMenu();
    navigate("/login", { replace: true });
  };

  const toggleMenuItem = (id: number) => {
    setMenuItemOpen((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(desktopNavLink, isActive && desktopNavLinkActive);

  return (
    <header className="sticky top-0 z-50 w-full bg-bg">
      <div className="hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 lg:px-8">
          <span className="text-base font-medium text-primary">{t("slogan")}</span>

          <div className="flex items-center gap-4">
            <div className="group relative">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 text-text-secondary transition-colors hover:text-primary"
                aria-haspopup="menu"
              >
                <Language width={16} height={16} aria-hidden="true" />
                <span>{lang === "vi" ? t("vietnamese") : t("english")}</span>
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                  aria-hidden="true"
                />
              </button>

              <div className="invisible absolute right-0 top-full z-[100] pt-1.5 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="overflow-hidden rounded border border-border bg-bg text-text-secondary shadow-lg">
                  <button
                    type="button"
                    className={clsx(
                      "block w-full cursor-pointer whitespace-nowrap px-6 py-2 text-center hover:bg-bg-secondary",
                      lang === "vi" && "text-primary",
                    )}
                    onClick={() => setLang("vi")}
                  >
                    {t("vietnamese")}
                  </button>
                  <button
                    type="button"
                    className={clsx(
                      "block w-full cursor-pointer whitespace-nowrap px-6 py-2 text-center hover:bg-bg-secondary",
                      lang === "en" && "text-primary",
                    )}
                    onClick={() => setLang("en")}
                  >
                    {t("english")}
                  </button>
                </div>
              </div>
            </div>

            <ThemeToggle />

            <Link
              to="/purchases"
              className="text-base font-medium tracking-tight text-text-secondary transition-colors hover:text-primary"
            >
              {t("manageOrder")}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-y border-border">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-3 lg:px-8">
          <h1 className="my-4 flex items-center">
            <Link className="text-xl font-bold text-primary no-underline" to="/">
              QuyDung
            </Link>
          </h1>

          <nav className="hidden md:flex" aria-label={t("menu")}>
            <ul className="m-0 flex list-none items-center gap-5 p-0">
              <li className="flex items-center">
                <NavLink to="/" className={navLinkClass}>
                  {t("sale")}
                </NavLink>
              </li>
              <li className="flex items-center">
                <NavLink to="/mattress" className={navLinkClass}>
                  {t("mattress")}
                </NavLink>
              </li>
              <li className="flex items-center">
                <NavLink to="/bedding" className={navLinkClass}>
                  {t("beddingSets")}
                </NavLink>
              </li>
              <li className="group relative flex items-center">
                <button
                  type="button"
                  className={clsx(
                    desktopNavLink,
                    "flex items-center gap-1",
                    isAccessoriesActive && desktopNavLinkActive,
                  )}
                  aria-haspopup="menu"
                >
                  <span>{t("accessories")}</span>
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    aria-hidden="true"
                  />
                </button>

                <div className="invisible absolute left-1/2 top-full z-[100] -translate-x-1/2 pt-2.5 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="overflow-hidden rounded-xl bg-bg shadow-lg">
                    <li>
                      <Link
                        className="block px-16 py-3 text-center font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary"
                        to="/accessories/blanket"
                      >
                        {t("blankets")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="block whitespace-nowrap px-16 py-3 text-center font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary"
                        to="/accessories/bed-sheet"
                      >
                        {t("bedSheets")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="block px-16 py-3 text-center font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary"
                        to="/accessories/pillow"
                      >
                        {t("pillows")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex items-center">
                <NavLink to="/support" className={navLinkClass}>
                  {t("support")}
                </NavLink>
              </li>
              <li className="flex items-center">
                <NavLink to="/contact" className={navLinkClass}>
                  {t("contact")}
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="cursor-pointer text-text-secondary transition-colors hover:text-primary"
              aria-label="Search"
            >
              <Search width={25} height={25} aria-hidden="true" />
            </button>

            <Link
              to={authUser ? "/cart" : "/login?returnTo=/cart"}
              className="relative cursor-pointer text-text-secondary transition-colors hover:text-primary"
              aria-label={t("shoppingCart")}
            >
              <ShoppingCart width={25} height={25} aria-hidden="true" />
              {cart.totalQuantity > 0 && (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-xs text-white">
                  {cart.totalQuantity > 99 ? "99+" : cart.totalQuantity}
                </span>
              )}
            </Link>

            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                className={clsx(
                  "flex cursor-pointer items-center gap-2 rounded-md py-2 text-text-secondary transition-colors hover:text-primary",
                  accountMenuOpen && "text-primary",
                )}
                aria-label={authUser ? `${t("hi")}, ${authUser.name}` : t("account")}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="account-menu"
                onClick={() => setAccountMenuOpen((current) => !current)}
              >
                <User width={25} height={25} aria-hidden="true" />
                {authUser && (
                  <span className="hidden max-w-48 truncate lg:inline">
                    {t("hi")}, {authUser.name}
                  </span>
                )}
              </button>

              {accountMenuOpen && (
                <div
                  id="account-menu"
                  role="menu"
                  className="absolute right-0 top-full z-[110] mt-2 w-52 overflow-hidden rounded-lg border border-border bg-bg p-1.5 text-sm shadow-xl"
                >
                  {authUser ? (
                    <>
                      {authUser.role.toLowerCase() === "admin" && (
                        <>
                          <Link
                            to="/admin/catalog"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                            onClick={closeAccountMenu}
                          >
                            <Package size={18} aria-hidden="true" />
                            {t("catalogManagement")}
                          </Link>
                          <Link
                            to="/admin/inventory"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                            onClick={closeAccountMenu}
                          >
                            <Boxes size={18} aria-hidden="true" />
                            {t("inventoryManagement")}
                          </Link>
                          <Link
                            to="/admin/orders"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                            onClick={closeAccountMenu}
                          >
                            <ClipboardList size={18} aria-hidden="true" />
                            {t("orderManagement")}
                          </Link>
                        </>
                      )}
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                        onClick={closeAccountMenu}
                      >
                        <UserRound size={18} aria-hidden="true" />
                        {t("profile")}
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} aria-hidden="true" />
                        {t("logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        role="menuitem"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                        onClick={closeAccountMenu}
                      >
                        <LogIn size={18} aria-hidden="true" />
                        {t("login")}
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                        onClick={closeAccountMenu}
                      >
                        <UserRoundPlus size={18} aria-hidden="true" />
                        {t("register")}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="cursor-pointer text-text-secondary transition-colors hover:text-primary md:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X width={25} height={25} aria-hidden="true" />
              ) : (
                <Menu width={25} height={25} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={clsx(
          "absolute inset-x-0 top-full z-[100] h-[calc(100dvh-4.125rem)] overflow-y-auto border-t border-border bg-bg transition-[opacity,transform,visibility] duration-200 md:hidden",
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1.5 opacity-0",
        )}
      >
        <div className="box-border p-2">
          <nav className="flex flex-col" aria-label={t("menu")}>
            <h2 className="mb-0 text-base font-medium uppercase text-text-tertiary">
              {t("menu")}
            </h2>

            <ul className="m-0 flex list-none flex-col p-0">
              <li className={mobileItem}>
                <Link className={mobileLink} to="/" onClick={closeMenu}>
                  {t("sale")}
                </Link>
              </li>
              <li className={mobileItem}>
                <Link className={mobileLink} to="/mattress" onClick={closeMenu}>
                  {t("mattress")}
                </Link>
              </li>
              <li className={mobileItem}>
                <Link className={mobileLink} to="/bedding" onClick={closeMenu}>
                  {t("beddingSets")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className={clsx(mobileItem, mobileAccordion)}
                  onClick={() => toggleMenuItem(1)}
                  aria-expanded={Boolean(menuItemOpen[1])}
                >
                  <span>{t("accessories")}</span>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "shrink-0 text-text-secondary transition-transform duration-200",
                      menuItemOpen[1] && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </li>

              {menuItemOpen[1] && (
                <>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <Link className={mobileLink} to="/accessories/blanket" onClick={closeMenu}>
                      {t("blankets")}
                    </Link>
                  </li>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <Link className={mobileLink} to="/accessories/bed-sheet" onClick={closeMenu}>
                      {t("bedSheets")}
                    </Link>
                  </li>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <Link className={mobileLink} to="/accessories/pillow" onClick={closeMenu}>
                      {t("pillows")}
                    </Link>
                  </li>
                </>
              )}

              <li className={mobileItem}>
                <Link className={mobileLink} to="/support" onClick={closeMenu}>
                  {t("support")}
                </Link>
              </li>
              <li className={mobileItem}>
                <Link className={mobileLink} to="/contact" onClick={closeMenu}>
                  {t("contact")}
                </Link>
              </li>
              <li className={mobileItem}>
                <Link className={mobileLink} to="/purchases" onClick={closeMenu}>
                  {t("manageOrder")}
                </Link>
              </li>
            </ul>
          </nav>

          <section className="flex flex-col">
            <h2 className="mb-0 text-base font-medium uppercase text-text-tertiary">
              {t("other")}
            </h2>

            <ul className="m-0 list-none p-0">
              <li>
                <button
                  type="button"
                  className={clsx(mobileItem, mobileAccordion)}
                  onClick={() => toggleMenuItem(2)}
                  aria-expanded={Boolean(menuItemOpen[2])}
                >
                  <span>{t("language")}</span>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "shrink-0 text-text-secondary transition-transform duration-200",
                      menuItemOpen[2] && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </li>

              {menuItemOpen[2] && (
                <>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className={mobileLink}>{t("vietnamese")}</span>
                      <input
                        type="radio"
                        name="language"
                        className="accent-primary"
                        checked={lang === "vi"}
                        onChange={() => setLang("vi")}
                      />
                    </label>
                  </li>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className={mobileLink}>{t("english")}</span>
                      <input
                        type="radio"
                        name="language"
                        className="accent-primary"
                        checked={lang === "en"}
                        onChange={() => setLang("en")}
                      />
                    </label>
                  </li>
                </>
              )}

              <li>
                <button
                  type="button"
                  className={clsx(mobileItem, mobileAccordion)}
                  onClick={() => toggleMenuItem(3)}
                  aria-expanded={Boolean(menuItemOpen[3])}
                >
                  <span>{t("theme")}</span>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "shrink-0 text-text-secondary transition-transform duration-200",
                      menuItemOpen[3] && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </li>

              {menuItemOpen[3] && (
                <>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className={mobileLink}>{t("light")}</span>
                      <input
                        type="radio"
                        name="theme"
                        className="accent-primary"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}
                      />
                    </label>
                  </li>
                  <li className={clsx(mobileItem, mobileSecondaryItem)}>
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className={mobileLink}>{t("dark")}</span>
                      <input
                        type="radio"
                        name="theme"
                        className="accent-primary"
                        checked={theme === "dark"}
                        onChange={() => setTheme("dark")}
                      />
                    </label>
                  </li>
                </>
              )}
            </ul>
          </section>
        </div>
      </div>
    </header>
  );
};

export default Header;
