import { createContext, useContext } from "react";
import type { translations } from "../i18n/i18n";

export type Language = "vi" | "en";

export type TranslationKey = keyof typeof translations["en"];

export type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};
