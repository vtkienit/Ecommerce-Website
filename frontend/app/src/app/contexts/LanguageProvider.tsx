import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { translations } from "../../shared/i18n/i18n";
import { LanguageContext } from "./LanguageContext";
import type { Language, TranslationKey } from "./LanguageContext";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "vi" || saved === "en") ? saved : "vi";
  });

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key: TranslationKey | string) => {
    if (key in translations[lang]) {
      return translations[lang][key as TranslationKey];
    }
    return key; // fallback
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
