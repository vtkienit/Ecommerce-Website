import { Link } from "react-router-dom";
import { useLanguage } from "../../app/contexts/LanguageContext";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
  ZALO_CONTACT_URL,
} from "../constants/contact";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-bg">
      <div className="max-w-7xl mx-auto px-3 md:px-6 pt-7 md:pt-12 pb-7">
        
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* BRAND */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-primary">QuyDung</h2>
            <p className="text-text-secondary leading-relaxed max-w-xs">
              {t("heroDesc")}
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h4 className="text-text font-semibold mb-3 tracking-tight">
              {t("menu")}
            </h4>
            <ul className="flex flex-col gap-2 text-text-secondary">
              <li><Link className="hover:text-primary" to="/sale">{t("sale")}</Link></li>
              <li><Link className="hover:text-primary" to="/mattress">{t("mattress")}</Link></li>
              <li><Link className="hover:text-primary" to="/catalog/bedding-sets">{t("beddingSets")}</Link></li>
              <li><Link className="hover:text-primary" to="/catalog/blankets">{t("accessories")}</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-text font-semibold mb-3 tracking-tight">
              {t("support")}
            </h4>
            <ul className="flex flex-col gap-2 text-text-secondary">
              <li><Link className="hover:text-primary" to="/support">{t("faq")}</Link></li>
              <li><Link className="hover:text-primary" to="/purchases">{t("manageOrder")}</Link></li>
            </ul>
          </div>

          {/* CONTACT / INFO */}
          <div>
            <h4 className="text-text font-semibold mb-3 tracking-tight">
              {t("contact")}
            </h4>
            <ul className="flex flex-col gap-2 text-text-secondary">
              <li>
                Email:{" "}
                <a className="cursor-pointer transition hover:text-primary" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                Hotline:{" "}
                <a className="cursor-pointer transition hover:text-primary" href={`tel:${SUPPORT_PHONE}`}>
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                Zalo:{" "}
                <a
                  className="cursor-pointer transition hover:text-primary"
                  href={ZALO_CONTACT_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li>{t("monday")} - {t("sunday")}: 8:00 - 22:00</li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-border my-7" />

        {/* BOTTOM */}
        <div className="flex justify-center items-center text-sm text-text-secondary">
          <span>© 2026 QuyDung. {t("rights")}.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
