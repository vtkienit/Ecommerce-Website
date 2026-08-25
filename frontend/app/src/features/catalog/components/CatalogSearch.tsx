import {
  ArrowRight,
  LoaderCircle,
  PackageSearch,
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import useDebouncedValue from "../../../shared/hooks/useDebouncedValue";
import { getProductSuggestions } from "../api/catalogApi";
import type { ProductSuggestion } from "../model/catalogTypes";

export default function CatalogSearch() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 300);
  const canSearch = normalizedQuery.length >= 2;
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (debouncedQuery.length < 2) return;

    const controller = new AbortController();
    requestRef.current = controller;

    getProductSuggestions(debouncedQuery, controller.signal)
      .then((products) => {
        setSuggestions(products);
        setActiveIndex(-1);
        setLoading(false);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setLoading(false);
        setError(requestError instanceof Error ? requestError.message : t("searchUnavailable"));
      });

    return () => {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    };
  }, [debouncedQuery, t]);

  const openProduct = (product: ProductSuggestion) => {
    setOpen(false);
    navigate(`/products/${product.slug}`);
  };

  const openAllResults = () => {
    if (!canSearch) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      openProduct(suggestions[activeIndex]);
      return;
    }
    openAllResults();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    }
  };

  const updateQuery = (value: string) => {
    requestRef.current?.abort();
    setQuery(value);
    setSuggestions([]);
    setActiveIndex(-1);
    setError("");
    setLoading(value.trim().length >= 2);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="cursor-pointer text-text-secondary transition-colors hover:text-primary"
        aria-label={t("searchProduct")}
        aria-expanded={open}
        aria-controls="catalog-search-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <Search width={25} height={25} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="catalog-search-panel"
          className="fixed left-3 right-3 top-[4.5rem] z-[120] overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-[30rem]"
        >
          <form className="flex items-center gap-3 border-b border-border p-3" onSubmit={handleSubmit}>
            <Search className="shrink-0 text-text-tertiary" size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("searchProduct")}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-base text-text outline-none placeholder:text-text-tertiary"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={suggestions.length > 0}
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                className="rounded-full p-1 text-text-tertiary transition hover:bg-bg-secondary hover:text-text"
                aria-label={t("clearProductSearch")}
                onClick={() => updateQuery("")}
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </form>

          <div className="max-h-[min(65vh,32rem)] overflow-y-auto p-2">
            {!canSearch && (
              <p className="px-3 py-6 text-center text-sm text-text-secondary">{t("searchMinCharacters")}</p>
            )}

            {canSearch && loading && (
              <div className="flex items-center justify-center gap-2 px-3 py-7 text-sm text-text-secondary">
                <LoaderCircle className="animate-spin text-primary" size={19} />
                {t("searchingProducts")}
              </div>
            )}

            {canSearch && !loading && error && (
              <p className="px-3 py-6 text-center text-sm text-red-600">{t("searchUnavailable")}</p>
            )}

            {canSearch && !loading && !error && suggestions.length === 0 && (
              <div className="px-3 py-7 text-center">
                <PackageSearch className="mx-auto text-text-tertiary" size={28} />
                <p className="mt-2 text-sm text-text-secondary">{t("searchNoResults")}</p>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <>
                <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  {t("searchSuggestions")}
                </p>
                <ul id={listboxId} role="listbox" className="space-y-1">
                  {suggestions.map((product, index) => (
                    <li key={product.id}>
                      <button
                        id={`${listboxId}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${index === activeIndex ? "bg-primary/10" : "hover:bg-bg-secondary"}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openProduct(product)}
                      >
                        <span className="flex h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-secondary">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <PackageSearch className="m-auto text-text-tertiary" size={22} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-text">{product.name}</span>
                          <span className="mt-0.5 block truncate text-sm text-text-secondary">
                            {[product.brand, product.categoryName].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          {currency.format(product.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-t border-border px-3 py-3 font-semibold text-primary transition hover:bg-primary/5"
                  onClick={openAllResults}
                >
                  {t("viewAllSearchResults")}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
