import { createContext, useContext, useEffect, useState } from "react";
import {translations} from "../i18n/i18n";

type Language = "vi" | "en";

type TranslationKey = keyof typeof translations["en"];

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};


const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside provider");
  return context;
};