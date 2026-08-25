import { useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { LoaderCircle, PackageSearch, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../app/contexts/LanguageContext";
import CatalogStatus from "../features/catalog/components/CatalogStatus";
import ProductCard from "../features/catalog/components/ProductCard";
import { useProducts } from "../features/catalog/hooks/useCatalog";
import MainLayout from "../shared/layouts/MainLayout";

export default function SearchResultsPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [draft, setDraft] = useState({ source: query, value: query });
  const draftQuery = draft.source === query ? draft.value : query;
  const { data, isLoading, isLoadingMore, error, hasMore, loadMore } = useProducts({
    search: query || undefined,
    sort: query ? "relevance,desc" : "newest,desc",
    size: 6,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = draftQuery.trim();
    if (!nextQuery) return;
    setSearchParams({ q: nextQuery });
  };

  const title = query
    ? t("searchResultsFor").replace("{query}", query)
    : t("searchAllProducts");

  return (
    <MainLayout>
      <Helmet>
        <title>{title} | QuyDung</title>
      </Helmet>

      <main className="min-h-[65vh] bg-bg-subtle">
        <section className="border-b border-border bg-bg px-3 py-10 md:py-14">
          <div className="mx-auto max-w-7xl lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("searchResults")}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-text md:text-4xl">{title}</h1>
            <form className="mt-6 flex max-w-2xl items-center gap-3 rounded-xl border border-border bg-bg px-4 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10" onSubmit={handleSubmit}>
              <Search className="shrink-0 text-text-tertiary" size={21} aria-hidden="true" />
              <input
                type="search"
                value={draftQuery}
                onChange={(event) => setDraft({ source: query, value: event.target.value })}
                placeholder={t("searchProduct")}
                className="min-w-0 flex-1 bg-transparent py-3.5 text-text outline-none placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                disabled={!draftQuery.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {t("search")}
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-3 py-8 lg:px-8 lg:py-10">
          {data && !isLoading && (
            <p className="mb-5 text-sm text-text-secondary">
              {t("productsFound").replace("{count}", String(data.totalElements))}
            </p>
          )}

          <CatalogStatus loading={isLoading} error={error} />

          {!isLoading && !error && data?.content.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <PackageSearch className="text-text-tertiary" size={38} />
              <p className="mt-3 font-semibold text-text">{t("searchNoResults")}</p>
              <p className="mt-1 text-sm text-text-secondary">{t("searchTryAnotherKeyword")}</p>
            </div>
          )}

          {data && data.content.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
                {data.content.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-9 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md border border-primary px-6 py-2.5 font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
                  >
                    {isLoadingMore && <LoaderCircle className="animate-spin" size={18} />}
                    {isLoadingMore ? t("loadingMore") : t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </MainLayout>
  );
}
