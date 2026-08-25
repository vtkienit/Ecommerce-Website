import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Globe2 } from "lucide-react";
import { useLanguage } from "../../app/contexts/LanguageContext";

export default function LanguageSelector({ hideLabelOnSmall = false }: {
  hideLabelOnSmall?: boolean;
}) {
  const { lang, setLang, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const currentLanguage = lang === "vi" ? t("vietnamese") : t("english");

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const changeLanguage = (language: "vi" | "en") => {
    setLang(language);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
        aria-label={currentLanguage}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Globe2 size={18} aria-hidden="true" />
        <span className={clsx(hideLabelOnSmall && "hidden md:inline")}>{currentLanguage}</span>
        <ChevronDown
          size={15}
          className={clsx("transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] pt-2">
          <div role="menu" className="w-36 overflow-hidden rounded-xl border border-border bg-bg p-1.5 shadow-xl">
            <LanguageOption active={lang === "vi"} onClick={() => changeLanguage("vi")}>
              {t("vietnamese")}
            </LanguageOption>
            <LanguageOption active={lang === "en"} onClick={() => changeLanguage("en")}>
              {t("english")}
            </LanguageOption>
          </div>
        </div>
      )}
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
