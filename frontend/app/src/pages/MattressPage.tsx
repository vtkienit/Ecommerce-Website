import { useState, type Dispatch, type SetStateAction } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDown, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../app/contexts/LanguageContext";
import bannerImg from "../assets/images/mattress_banner.png";
import CatalogStatus from "../features/catalog/components/CatalogStatus";
import FilterMobile from "../features/catalog/components/FilterMobile";
import FilterSidebar from "../features/catalog/components/FilterSidebar";
import ProductCard from "../features/catalog/components/ProductCard";
import { useCategories, useProducts } from "../features/catalog/hooks/useCatalog";
import { getPriceBounds } from "../features/catalog/model/catalogFilters";
import type { ProductQuery } from "../features/catalog/model/catalogTypes";
import MainLayout from "../shared/layouts/MainLayout";

const categoryTranslationKeys = {
  mattress: "mattress",
  "bedding-sets": "beddingSets",
  blankets: "blankets",
  "bed-sheets": "bedSheets",
  pillows: "pillows",
} as const;

export default function MattressPage() {
  const { t } = useLanguage();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const catalogSlug = categorySlug || "mattress";
  const categories = useCategories();
  const translationKey = categoryTranslationKeys[catalogSlug as keyof typeof categoryTranslationKeys];
  const categoryName = translationKey
    ? t(translationKey)
    : categories.data?.find((category) => category.slug === catalogSlug)?.name
      || catalogSlug.replaceAll("-", " ");
  const sortOptions: { value: NonNullable<ProductQuery["sort"]>; label: string }[] = [
    { value: "newest,desc", label: t("default") },
    { value: "price,asc", label: t("priceAsc") },
    { value: "price,desc", label: t("priceDesc") },
    { value: "name,asc", label: "A - Z" },
    { value: "name,desc", label: "Z - A" },
  ];
  const [sort, setSort] = useState<NonNullable<ProductQuery["sort"]>>("newest,desc");
  const [openFilters, setOpenFilters] = useState(["price", "size", "color"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const priceBounds = getPriceBounds(selectedPrices);
  const { data, isLoading, isLoadingMore, error, hasMore, loadMore } = useProducts({
    category: catalogSlug,
    sort,
    sizes: selectedSizes,
    colors: selectedColors,
    ...priceBounds,
    size: 6,
  });

  const toggleFilter = (key: string) => {
    setOpenFilters((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  };

  const toggleSelection = (
    value: string,
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) => {
    setSelected((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedPrices([]);
    setSelectedColors([]);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{categoryName} | QuyDung</title>
      </Helmet>

      <section className="relative flex h-[300px] items-center overflow-hidden bg-bg">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={bannerImg}
          className="absolute inset-0 h-full w-full object-cover brightness-[0.8]"
          alt={categoryName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:bg-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-3 text-center lg:px-8">
          <h1 className="text-4xl font-semibold capitalize tracking-tight text-white md:text-7xl">{categoryName}</h1>
          {catalogSlug === "mattress" && (
            <p className="mx-auto mt-3 max-w-3xl text-lg text-gray-200 md:text-xl">{t("mattressHeroDesc")}</p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-3 pb-8 pt-3 lg:px-8">
        <nav className="mb-4 flex items-center text-base text-text-secondary">
          <Link to="/" className="hover:text-primary">{t("home")}</Link>
          <span className="mx-2">›</span>
          <span className="font-medium capitalize text-text">{categoryName}</span>
        </nav>

        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 text-text-secondary"
            onClick={() => setMobileOpen(true)}
          >
            <SlidersHorizontal size={19} />
            {t("sort")} / {t("filters")}
          </button>
          {data && <span className="text-sm text-text-secondary">{t("productsFound").replace("{count}", String(data.totalElements))}</span>}
        </div>

        <div className="flex gap-4">
          <FilterSidebar
            openFilters={openFilters}
            toggleFilter={toggleFilter}
            selectedSizes={selectedSizes}
            selectedPrices={selectedPrices}
            selectedColors={selectedColors}
            toggleSelection={toggleSelection}
            setSelectedSizes={setSelectedSizes}
            setSelectedPrices={setSelectedPrices}
            setSelectedColors={setSelectedColors}
          />

          <section className="min-w-0 flex-1">
            <div className="mb-5 hidden items-center justify-between lg:flex">
              <span className="text-sm text-text-secondary">
                {data && t("productsFound").replace("{count}", String(data.totalElements))}
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as NonNullable<ProductQuery["sort"]>)}
                  className="cursor-pointer appearance-none rounded-md border border-border bg-bg px-4 py-2 pr-10 text-text-secondary outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              </div>
            </div>

            <CatalogStatus loading={isLoading} error={error} empty={!isLoading && !error && data?.content.length === 0} />
            {data && data.content.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
                  {data.content.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md border border-primary px-6 py-2.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoadingMore && <LoaderCircle size={18} className="animate-spin" />}
                      {isLoadingMore ? t("loadingMore") : t("loadMore")}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <FilterMobile
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sort={sort}
          setSort={(value) => setSort(value as NonNullable<ProductQuery["sort"]>)}
          sortOptions={sortOptions}
          clearAllFilters={clearAllFilters}
          openFilters={openFilters}
          toggleFilter={toggleFilter}
          selectedSizes={selectedSizes}
          selectedPrices={selectedPrices}
          selectedColors={selectedColors}
          toggleSelection={toggleSelection}
          setSelectedSizes={setSelectedSizes}
          setSelectedPrices={setSelectedPrices}
          setSelectedColors={setSelectedColors}
        />
      </main>
    </MainLayout>
  );
}
