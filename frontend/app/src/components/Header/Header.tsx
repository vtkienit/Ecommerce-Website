import React, { useState, useRef, useEffect } from "react"; 
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Menu, X} from "lucide-react";
import Language from "../../assets/icons/language.svg?react";
import User from "../../assets/icons/user.svg?react";
import clsx from "clsx";
import styles from "./Header.module.css";
import ThemeToggle from "../ThemeToggle";
import { useLanguage } from "../../contexts/LanguageProvider";
import { useTheme } from "../../contexts/ThemeProvider";

const Header = () => {
  const userName = localStorage.getItem("userName") || "";
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItemOpen, setMenuItemOpen] = useState<Record<number, boolean>>({});
  const location = useLocation();
  const isAccessoriesActive = location.pathname.startsWith("/accessories");

  const toggleMenuItem = (id: number) => {
    setMenuItemOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <header className="w-full bg-bg sticky top-0 z-50">
      {/* TOP HEADER */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between px-3 lg:px-8 py-1.5 max-w-7xl mx-auto">
          <div>
            <span className="text-base font-medium text-primary"> {t("slogan")} </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* LANGUAGE */}
            <div className={clsx(styles["header__top-lang"], "relative cursor-pointer group")} >
              <button className={ "flex gap-2 items-center cursor-pointer text-text-secondary hover:text-primary "}>
                <Language width={16} height={16} />
                <span>{lang === "vi" ? "Tiếng Việt" : "English"}</span>
                <ChevronDown size={16} className={clsx("transition-transform duration-200", "group-hover:rotate-180")}/>
              </button>

              <div className="absolute pt-1.5 z-[100]">
                <div className={"hidden group-hover:block text-text-secondary top-full bg-bg border border-border rounded shadow-lg"}>
                  <p className={clsx("text-center px-6 py-2 cursor-pointer whitespace-nowrap hover:bg-bg-secondary", lang==="vi" && "text-primary")} onClick={() => setLang("vi")}>
                    {t("vietnamese")}
                  </p>
                  <p className={clsx("text-center px-6 py-2 cursor-pointer whitespace-nowrap hover:bg-bg-secondary", lang==="en" && "text-primary")} onClick={() => setLang("en")}>
                    {t("english")}
                  </p>
                </div>
              </div>
            </div>

            {/* THEME */}
            <ThemeToggle />

            <Link to="/manage-order" className={"text-base text-text-secondary tracking-tight font-medium hover:text-primary"}>
              {t("manageOrder")}
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="border-y border-border">
        <div className="flex items-center justify-between px-3 lg:px-8 max-w-[1280px] mx-auto">

          {/* Left */}
          <h1 className="flex items-center my-4">
            <Link className="text-xl font-bold text-primary no-underline" to="/">QuyDung</Link>
          </h1>

          {/* NAV */}
          <nav className="hidden md:flex justify-center">
            <div className="flex items-center justify-center max-w-7xl mx-auto px-4">
              <ul className="flex gap-5 list-none p-0 m-0">
                <li className={styles["header__menu-item"]}><NavLink to="/" className={({ isActive }) => isActive ? styles["--active"] : ""} >{t("sale")}</NavLink></li>
                <li className={styles["header__menu-item"]}><NavLink to="/mattress" className={({ isActive }) => isActive ? styles["--active"] : ""} >{t("mattress")}</NavLink></li>
                <li className={styles["header__menu-item"]}><NavLink to="/bedding" className={({ isActive }) => isActive ? styles["--active"] : ""} >{t("beddingSets")}</NavLink></li>
                <li className={clsx("relative group")}>
                  <div className={clsx(styles["header__menu-item"])}>
                    <span className={isAccessoriesActive ? styles["--active"] : ""}>
                      {t("accessories")}
                    </span>
                    <ChevronDown size={14} className={clsx(styles["icon"], "transition-transform duration-200", "group-hover:rotate-180")} />
                  </div>

                  {/* dropdown */}
                    <div
                      className="
                        absolute top-full pt-2.5
                        left-1/2 -translate-x-1/2
                        opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible
                        transition-opacity duration-400
                        z-[100]
                      "
                    >
                      <ul className=" bg-bg rounded-xl shadow-lg overflow-hidden">
                        <li className="px-16 py-3 hover:bg-bg-secondary cursor-pointer text-center">
                          <Link className="text-text-secondary font-medium" to="" > {t("blankets")} </Link>
                        </li>
                        <li className="px-16 py-3 hover:bg-bg-secondary cursor-pointer text-center">
                          <Link className="text-text-secondary font-medium whitespace-nowrap" to=""> {t("bedSheets")} </Link>
                        </li>
                        <li className="px-16 py-3 hover:bg-bg-secondary cursor-pointer text-center">
                          <Link className="text-text-secondary font-medium" to=""> {t("pillows")} </Link>
                        </li>
                      </ul>
                    </div>
                </li>
                <li className={styles["header__menu-item"]}><NavLink to="/support" className={({ isActive }) => isActive ? styles["--active"] : ""} >{t("support")}</NavLink></li>
                <li className={styles["header__menu-item"]}><NavLink to="/contact" className={({ isActive }) => isActive ? styles["--active"] : ""} >{t("contact")}</NavLink></li>
              </ul>
            </div>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <button className="text-text-secondary cursor-pointer">
              <Search width={25} height={25} />
            </button>

            <button className="relative text-text-secondary cursor-pointer">
              <ShoppingCart width={25} height={25}/>
              <span className="absolute -top-2 -right-1.5 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                2
              </span>
            </button>

            <button className={"flex text-text-secondary cursor-pointer"}>
              <User width={25} height={25}/>

              {userName && <span className="hidden lg:flex">
                {t("hi")}, {userName}
              </span>}
            </button>

            <button className="text-text-secondary cursor-pointer md:hidden" onClick={() => setMenuOpen(prev => !prev)}>
              {menuOpen ? (
                <X width={25} height={25} />
              ) : (
                <Menu width={25} height={25} />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={styles["header__menu-mobile"]}>
          <div className={styles["header__menu-mobile-container"]}>
            {/* MENU */}
            <nav className="flex flex-col">
              <h3 className={styles["header__menu-mobile-title"]}>{t("menu")}</h3>

              <ul className="list-none p-0 m-0 flex flex-col">
                <li className={styles["header__menu-mobile-item"]}><Link to="/sale">{t("sale")}</Link></li>
                <li className={styles["header__menu-mobile-item"]}><Link to="/mattress">{t("mattress")}</Link></li>
                <li className={styles["header__menu-mobile-item"]}><Link to="/bedding">{t("beddingSets")}</Link></li>
                <li className={clsx(styles["header__menu-mobile-item"], "flex justify-between items-center cursor-pointer")} onClick={() => toggleMenuItem(1)} >
                  <Link to="#">{t("accessories")}</Link>
                  {<ChevronDown size={16} className={clsx(styles.icon, "transition-transform duration-200", menuItemOpen[1] && "rotate-180")}/>}
                </li>

                {menuItemOpen[1] && (
                  <>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/blanket">{t("blankets")}</Link>
                  </li>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/bed-sheet">{t("bedSheets")}</Link>
                  </li>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/pillow">{t("pillows")}</Link>
                  </li>
                  </>
                )}

                <li className={styles["header__menu-mobile-item"]}>
                  <Link to="/support">{t("support")}</Link>
                </li>
                <li className={styles["header__menu-mobile-item"]}>
                  <Link to="/contact">{t("contact")}</Link>
                </li>
                <li className={styles["header__menu-mobile-item"]}>
                  <Link to="/manage-order">{t("manageOrder")}</Link>
                </li>
              </ul>
            </nav>

            {/* OTHER */}
            <section className="flex flex-col">
              <h3 className={styles["header__menu-mobile-title"]}>{t("other")}</h3>

              <ul>
                <li className={clsx(styles["header__menu-mobile-item"], "flex justify-between items-center cursor-pointer")} onClick={() => toggleMenuItem(2)}>
                  <Link to="#">{t("language")}</Link>
                  {<ChevronDown size={16} className={clsx(styles.icon, "transition-transform duration-200", menuItemOpen[2] && "rotate-180")}/>}
                </li>

                {menuItemOpen[2] && (
                  <>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"], "flex justify-between items-center cursor-pointer")} >
                    <span>{t("vietnamese")}</span>
                    <input type="radio" name="language" checked={lang === "vi"} onChange={() => setLang("vi")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"], "flex justify-between items-center cursor-pointer")} >
                    <span>{t("english")}</span>
                    <input type="radio" name="language" checked={lang === "en"} onChange={() => setLang("en")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  </>
                )}

                <li className={clsx(styles["header__menu-mobile-item"], "flex justify-between items-center cursor-pointer")} onClick={() => toggleMenuItem(3)}>
                  <Link to="#">{t("theme")}</Link>
                  {<ChevronDown size={16} className={clsx(styles.icon, "transition-transform duration-200", menuItemOpen[3] && "rotate-180")}/>}
                </li>

                {menuItemOpen[3] && (
                  <>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"], "flex justify-between items-center cursor-pointer")}>
                    <span>{t("light")}</span>
                    <input type="radio" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"], "flex justify-between items-center cursor-pointer")}>
                    <span>{t("dark")}</span>
                    <input type="radio" name="theme" checked={theme === "dark"} onChange={() => setTheme("dark")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  </>
                )}
              </ul>
            </section>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;