import clsx from "clsx";
import { ChevronDown, Globe2 } from "lucide-react";
import { useLanguage } from "../../app/contexts/LanguageContext";

export default function LanguageSelector({ hideLabelOnSmall = false }: {
  hideLabelOnSmall?: boolean;
}) {
  const { lang, setLang, t } = useLanguage();
  const currentLanguage = lang === "vi" ? t("vietnamese") : t("english");

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
        aria-label={currentLanguage}
        aria-haspopup="menu"
      >
        <Globe2 size={18} aria-hidden="true" />
        <span className={clsx(hideLabelOnSmall && "hidden md:inline")}>{currentLanguage}</span>
        <ChevronDown
          size={15}
          className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden="true"
        />
      </button>

      <div className="invisible absolute right-0 top-full z-[100] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div role="menu" className="w-36 overflow-hidden rounded-xl border border-border bg-bg p-1.5 shadow-xl">
          <LanguageOption active={lang === "vi"} onClick={() => setLang("vi")}>
            {t("vietnamese")}
          </LanguageOption>
          <LanguageOption active={lang === "en"} onClick={() => setLang("en")}>
            {t("english")}
          </LanguageOption>
        </div>
      </div>
    </div>
  );
}

function LanguageOption({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={clsx(
        "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-primary",
        active && "bg-primary/10 text-primary",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
