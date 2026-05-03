import React, { useState, useRef, useEffect } from "react"; 
import { useClickOutside } from "../../hooks/useClickOutside";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Menu, ChevronUp, X} from "lucide-react";
import Language from "../../assets/icons/language.svg?react";
import User from "../../assets/icons/user.svg?react";
import clsx from "clsx";
import styles from "./Header.module.css";
import Button from "../Button/Button";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useLanguage } from "../../contexts/LanguageProvider";
import { useTheme } from "../../contexts/ThemeProvider";

const Header = () => {
  const userName = localStorage.getItem("userName") || "";
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItemOpen, setMenuItemOpen] = useState<Record<number, boolean>>({});

  const toggleMenuItem = (id: number) => {
    setMenuItemOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <header className="w-full bg-[var(--bg)] sticky top-0 z-50">
      {/* TOP HEADER */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between px-6 lg:px-10 py-1.5 max-w-7xl mx-auto">
          <div>
            <span className="text-base font-medium text-primary"> {t("slogan")} </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* LANGUAGE */}
            <div className={clsx(styles["header__top-lang"], "relative cursor-pointer group")} >
              <Button className={styles["lang__btn"]}>
                <Language width={16} height={16} className={styles["icon"]}/>
                <span>{lang === "vi" ? "Tiếng Việt" : "English"}</span>
                <ChevronDown size={16} className={clsx(styles.icon, "group-hover:hidden")}/>
                <ChevronUp size={16} className={clsx(styles.icon, "hidden group-hover:flex")}/>
              </Button>

              <div className="absolute pt-1.5 z-[100]">
                <div className={styles["lang__menu-container"]}>
                  <p className={clsx(styles.lang__item, lang==="vi" && "!text-primary")} onClick={() => setLang("vi")}>
                    {t("vietnamese")}
                  </p>
                  <p className={clsx(styles.lang__item, lang==="en" && "!text-primary")} onClick={() => setLang("en")}>
                    {t("english")}
                  </p>
                </div>
              </div>
            </div>

            {/* THEME */}
            <ThemeToggle />

            <Link to="/manage-order" className={styles["header__top-right-link"]}>
              {t("manageOrder")}
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="border-y border-[var(--border)]">
        <div className="flex items-center justify-between px-2 md:px-6 lg:px-10 max-w-[1280px] mx-auto">

          {/* Left */}
          <h1 className="flex items-center my-4">
            <Link className="text-xl font-bold text-primary no-underline" to="/">QuyDung</Link>
          </h1>

          {/* NAV */}
          <nav className="hidden md:flex justify-center">
            <div className="flex items-center justify-center max-w-7xl mx-auto px-4">
              <ul className="flex gap-5 list-none p-0 m-0">
                <li className={clsx(styles["header__menu-item"], styles["--active"])}><Link to="/" >{t("sale")}</Link></li>
                <li className={styles["header__menu-item"]}><Link to="/mattress" >{t("mattress")}</Link></li>
                <li className={styles["header__menu-item"]}><Link to="/bedding" >{t("beddingSets")}</Link></li>
                <li className={clsx("relative group")}>
                  <div className={clsx(styles["header__menu-item"])}>
                    <Link to="/accessories" > {t("accessories")}</Link>
                    <ChevronDown size={14} className={clsx(styles["icon"], "group-hover:hidden")} />
                    <ChevronUp size={14} className={clsx(styles["icon"], "hidden group-hover:flex")} />
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
                          <Link className="text-text-secondary font-medium" to=""> {t("bedSheets")} </Link>
                        </li>
                        <li className="px-16 py-3 hover:bg-bg-secondary cursor-pointer text-center">
                          <Link className="text-text-secondary font-medium" to=""> {t("pillows")} </Link>
                        </li>
                      </ul>
                    </div>
                </li>
                <li className={styles["header__menu-item"]}><Link to="/support" >{t("support")}</Link></li>
                <li className={styles["header__menu-item"]}><Link to="/contact" >{t("contact")}</Link></li>
              </ul>
            </div>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <Button>
              <Search className={styles.icon} width={25} height={25} />
            </Button>

            <Button variant="secondary" className="relative">
              <ShoppingCart className={styles.icon} width={25} height={25}/>
              <span className="absolute -top-2 -right-1.5 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                2
              </span>
            </Button>

            <Button className={styles.header__user}>
              <User className={styles.icon} width={25} height={25}/>

              {userName && <span className="hidden lg:flex">
                {t("hi")}, {userName}
              </span>}
            </Button>

            <Button className="md:!hidden" onClick={() => setMenuOpen(prev => !prev)}>
              {menuOpen ? (
                <X className={styles.icon} width={25} height={25} />
              ) : (
                <Menu className={styles.icon} width={25} height={25} />
              )}
            </Button>
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
                  {menuItemOpen[1] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
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
                  {menuItemOpen[2] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
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
                  {menuItemOpen[3] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
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