import React, { useState, useRef, useEffect } from "react"; 
import { useClickOutside } from "../../hooks/useClickOutside";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Menu, ChevronUp} from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItemOpen, setMenuItemOpen] = useState<Record<number, boolean>>({});

  // Close language menu when clicking outside
  useClickOutside(langRef, () => setOpen(false));

  const handleChangeLang = (value: "vi" | "en") => {
    setLang(value);
    setOpen(false);
  };

  const toggleMenuItem = (id: number) => {
    setMenuItemOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <header className={styles.header}>
      <div className={styles["header__container"]}>
        
        {/* TOP HEADER */}
        <div className={styles.header__top}>
          <div className={styles["header__top-container"]}>
            <div className={styles["header__top-left"]}>
              <span className={styles["header__top-left--badge"]}> {t("slogan")} </span>
            </div>

            <div className={styles["header__top-right"]}>
              
              {/* LANGUAGE */}
              <div className={styles.lang} ref={langRef}>
                <button className={styles["lang__btn"]} onClick={() => setOpen(prev => !prev)}>
                  <Language width={16} height={16} className={styles["lang__btn-icon"]}/>
                  {lang === "vi" ? "Tiếng Việt" : "English"}
                  <ChevronDown size={16} />
                </button>

                {open && (
                  <div className={styles.lang__menu}>
                    <p className={styles.lang__item} onClick={() => handleChangeLang("vi")}>
                      {t("vietnamese")}
                    </p>
                    <p className={styles.lang__item} onClick={() => handleChangeLang("en")}>
                      {t("english")}
                    </p>
                  </div>
                )}
              </div>

              {/* THEME */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className={styles.header__main}>
          <div className={styles["header__main-container"]}>

            {/* Left */}
            <h1 className={styles.header__logo}>
              <a href="/">QuyDung</a>
            </h1>

            {/* NAV */}
            <nav className={styles.header__menu}>
              <div className={styles["header__menu-container"]}>
                <ul>
                  <li><Link to="/" className={clsx(styles["header__menu-item"], styles["header__menu-item--active"])}>{t("sale")}</Link></li>
                  <li><Link to="/mattress" className={styles["header__menu-item"]}>{t("mattress")}</Link></li>
                  <li><Link to="/bedding" className={styles["header__menu-item"]}>{t("bedding")}</Link></li>
                  <li><Link to="/accessories" className={styles["header__menu-item"]}>{t("accessories")}</Link></li>
                  <li><Link to="/support" className={styles["header__menu-item"]}>{t("support")}</Link></li>
                  <li><Link to="/contact" className={styles["header__menu-item"]}>{t("contact")}</Link></li>
                </ul>
              </div>
            </nav>

            {/* RIGHT */}
            <div className={styles["header__main-right"]}>
              <Button>
                <Search className={styles.icon} width={25} height={25} />
              </Button>

              <Button variant="secondary" className={styles.header__cart}>
                <ShoppingCart className={styles.icon} width={25} height={25}/>
                <span className={styles["header__cart-badge"]}>
                  2
                </span>
              </Button>

              <Button className={styles.header__user}>
                <User className={styles.icon} width={25} height={25}/>

                {userName && <span className={styles["header__user--username"]}>
                  {t("hi")}, {userName}
                </span>}
              </Button>

              <Button onClick={() => setMenuOpen(true)}>
                <Menu className={styles.icon} width={25} height={25} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={styles["header__menu-mobile"]}>
          <div className={styles["header__menu-mobile-container"]}>
            {/* MENU */}
            <nav className={styles["header__menu-mobile-section"]}>
              <h3 className={styles["header__menu-mobile-title"]}>{t("menu")}</h3>

              <ul>
                <li className={styles["header__menu-mobile-item"]}><Link to="/sale">{t("sale")}</Link></li>
                <li className={styles["header__menu-mobile-item"]}><Link to="/mattress">{t("mattress")}</Link></li>
                <li className={styles["header__menu-mobile-item"]}><Link to="/bedding">{t("bedding")}</Link></li>
                <li className={styles["header__menu-mobile-item"]} onClick={() => toggleMenuItem(1)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                  <Link to="#">{t("accessories")}</Link>
                  {menuItemOpen[1] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
                </li>

                {menuItemOpen[1] && (
                  <>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/blanket">{t("blanket")}</Link>
                  </li>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/bed-sheet">{t("bedSheet")}</Link>
                  </li>
                  <li className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])}>
                    <Link to="/accessories/pillow">{t("pillow")}</Link>
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
            <section className={styles["header__menu-mobile-section"]}>
              <h3 className={styles["header__menu-mobile-title"]}>{t("other")}</h3>

              <ul>
                <li className={styles["header__menu-mobile-item"]} onClick={() => toggleMenuItem(2)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                  <Link to="#">{t("language")}</Link>
                  {menuItemOpen[2] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
                </li>

                {menuItemOpen[2] && (
                  <>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                    <span>{t("vietnamese")}</span>
                    <input type="radio" name="language" checked={lang === "vi"} onChange={() => handleChangeLang("vi")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                    <span>{t("english")}</span>
                    <input type="radio" name="language" checked={lang === "en"} onChange={() => handleChangeLang("en")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  </>
                )}

                <li className={styles["header__menu-mobile-item"]} onClick={() => toggleMenuItem(3)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                  <Link to="#">{t("theme")}</Link>
                  {menuItemOpen[3] ? <ChevronUp size={16} className={styles.icon} /> : <ChevronDown size={16} className={styles.icon} />}
                </li>

                {menuItemOpen[3] && (
                  <>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
                    <span>{t("light")}</span>
                    <input type="radio" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} onClick={(e) => e.stopPropagation()} />
                  </label>
                  <label className={clsx(styles["header__menu-mobile-item"], styles["--secondary"])} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"}}>
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