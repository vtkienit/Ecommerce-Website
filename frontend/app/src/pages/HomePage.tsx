import { useEffect, useRef, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ChevronRight, ShieldCheck, Timer, Truck } from "lucide-react";
import { useLanguage } from "../app/contexts/LanguageContext";
import bannerImg from "../assets/images/home_banner.png";
import mattressImg from "../assets/images/mattress.png";
import beddingSetsImg from "../assets/images/bedding_sets.png";
import blanketsImg from "../assets/images/blankets.png";
import bedSheetsImg from "../assets/images/bed_sheets.png";
import pillowsImg from "../assets/images/pillows.png";
import CatalogStatus from "../features/catalog/components/CatalogStatus";
import ProductCard from "../features/catalog/components/ProductCard";
import { useCategories, useCurrentFlashSale } from "../features/catalog/hooks/useCatalog";
import type { Category } from "../features/catalog/model/catalogTypes";
import useDragScroll from "../shared/hooks/useDragScroll";
import MainLayout from "../shared/layouts/MainLayout";

const categoryImages: Record<string, string> = {
  mattress: mattressImg,
  "bedding-sets": beddingSetsImg,
  blankets: blanketsImg,
  "bed-sheets": bedSheetsImg,
  pillows: pillowsImg,
};

export default function HomePage() {
  const { t } = useLanguage();
  const flashSaleSliderRef = useRef<HTMLDivElement>(null);
  const collectionsSliderRef = useRef<HTMLDivElement>(null);
  const flashSaleDragEvents = useDragScroll(flashSaleSliderRef);
  const collectionsDragEvents = useDragScroll(collectionsSliderRef);
  const flashSale = useCurrentFlashSale();
  const categories = useCategories();

  return (
    <MainLayout>
      <Helmet>
        <title>{t("home")}</title>
      </Helmet>

      <section className="relative h-[400px] w-full overflow-hidden md:h-[430px]">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={bannerImg}
            className="h-full w-full object-cover brightness-[0.8]"
            alt="Restorative comfort"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:bg-black/20" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-3 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white md:text-7xl">
              {t("slogan1")},<br />{t("slogan2")}
            </h1>
            <p className="mb-10 max-w-md text-lg text-gray-200 md:text-xl">{t("heroDesc")}</p>
            <Link
              to="/mattress"
              className="inline-flex rounded-md bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/80"
            >
              {t("shopNow")}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="overflow-hidden py-12">
        <div className="mx-auto max-w-7xl px-3 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="mb-2 text-sm font-bold uppercase text-primary">{t("limitedTime")}</span>
              <h2 className="text-2xl font-semibold text-text md:text-5xl">
                {flashSale.data?.name || t("flashSale")}
              </h2>
              {flashSale.data && (
                <div className="mt-3 flex items-center gap-2 md:hidden">
                  <Timer size={16} className="text-primary" strokeWidth={2.5} />
                  <span className="text-base text-text-secondary">{t("endsIn")}</span>
                  <Countdown
                    key={`mobile-${flashSale.data.id}-${flashSale.data.remainingSeconds}`}
                    initialSeconds={flashSale.data.remainingSeconds}
                  />
                </div>
              )}
            </div>

            {flashSale.data && (
              <div className="hidden items-center gap-3 rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm md:flex">
                <Timer size={16} className="text-primary" strokeWidth={2.5} />
                <span className="text-text-secondary">{t("endsIn")}</span>
                <Countdown
                  key={`desktop-${flashSale.data.id}-${flashSale.data.remainingSeconds}`}
                  initialSeconds={flashSale.data.remainingSeconds}
                />
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end md:mt-4">
            <Link to="/mattress" className="flex items-center gap-2 font-semibold text-primary">
              {t("viewAll")} <ChevronRight size={15} />
            </Link>
          </div>

          <CatalogStatus
            loading={flashSale.isLoading}
            error={flashSale.error}
            empty={!flashSale.isLoading && !flashSale.error && !flashSale.data}
            compact
          />
          {flashSale.data && (
            <div
              ref={flashSaleSliderRef}
              {...flashSaleDragEvents}
              className="hide-scrollbar flex cursor-grab touch-pan-y select-none gap-3 overflow-x-auto py-2 active:cursor-grabbing md:py-3 lg:gap-5"
            >
              {flashSale.data.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="w-[176px] shrink-0 lg:w-[240px]"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-3 lg:px-8">
          <h2 className="text-2xl font-semibold text-text md:text-5xl">{t("collections")}</h2>
          <div className="mt-2 flex justify-end md:mt-4">
            <Link to="/mattress" className="flex items-center gap-2 font-semibold text-primary">
              {t("viewAll")} <ChevronRight size={15} />
            </Link>
          </div>

          <CatalogStatus
            loading={categories.isLoading}
            error={categories.error}
            empty={!categories.isLoading && !categories.error && categories.data?.length === 0}
            compact
          />
          {categories.data && (
            <div
              ref={collectionsSliderRef}
              {...collectionsDragEvents}
              className="hide-scrollbar flex cursor-grab touch-pan-y select-none gap-3 overflow-x-auto py-2 active:cursor-grabbing md:gap-5 md:py-3"
            >
              {categories.data.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-20 md:grid-cols-3">
            <FeatureCard
              icon={<Award className="text-primary/70" size={40} strokeWidth={1} />}
              title={t("highQuality")}
              desc={t("highQualityDesc")}
            />
            <FeatureCard
              icon={<Truck className="text-primary/70" size={40} strokeWidth={1} />}
              title={t("fastDelivery")}
              desc={t("fastDeliveryDesc")}
            />
            <FeatureCard
              icon={<ShieldCheck className="text-primary/70" size={40} strokeWidth={1} />}
              title={t("warranty")}
              desc={t("warrantyDesc")}
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const { t } = useLanguage();
  const image = categoryImages[category.slug] || mattressImg;
  const to = category.slug === "mattress" ? "/mattress" : `/catalog/${category.slug}`;

  return (
    <Link
      to={to}
      className="group relative min-w-[200px] overflow-hidden rounded-md bg-bg shadow-sm transition-shadow duration-500 hover:shadow-lg lg:min-w-[280px]"
    >
      <img
        src={image}
        className="pointer-events-none aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-110"
        alt={category.name}
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-5 pl-3">
        <div>
          <h3 className="text-2xl font-semibold text-white decoration-2 underline-offset-8 group-hover:underline">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-white/75">
            {t("productsFound").replace("{count}", String(category.productCount))}
          </p>
        </div>
      </div>
    </Link>
  );
}

function Countdown({ initialSeconds }: { initialSeconds: number }) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    const deadline = Date.now() + initialSeconds * 1_000;
    const interval = window.setInterval(() => {
      setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1_000)));
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [initialSeconds]);

  return <span className="font-mono text-base font-semibold text-text">{formatTimeLeft(remainingSeconds)}</span>;
}

function formatTimeLeft(remainingSeconds: number) {
  const hours = Math.floor(remainingSeconds / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(" : ");
}

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-bg shadow-sm transition-transform duration-500 hover:scale-110">
        {icon}
      </div>
      <h4 className="mb-4 text-2xl font-semibold tracking-tight text-text">{title}</h4>
      <p className="max-w-xs text-base text-text-secondary">{desc}</p>
    </div>
  );
}
