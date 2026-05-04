import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageProvider";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import bannerImg from "../assets/images/mattress_banner.png"
import Button from "../components/Button/Button";
import clsx from "clsx";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";

/* ===== MOCK DATA (reuse style Home) ===== */
const products = [
  {
    id: 1,
    title: 'Linen Duvet Set',
    price: 189.0,
    originalPrice: 270.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    category: 'Linen Collection'
  },
  {
    id: 2,
    title: 'Bamboo Silk Pillowcase',
    price: 45.0,
    originalPrice: 65.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Silk Collection'
  },
  {
    id: 3,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology'
  },
  {
    id: 4,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology'
  }
];

export default function Mattress() {
  const { t } = useLanguage();
  const sortOptions = [
    t("default"),
    t("priceAsc"),
    t("priceDesc"),
    t("discountAsc"),
    t("discountDesc"),
  ];

  const [sort, setSort] = useState(sortOptions[0]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (key: string) => {
    setOpenFilter(prev => (prev === key ? null : key));
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{t("mattress")}</title>
      </Helmet>

      <section className="flex items-center bg-bg relative h-[300px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={bannerImg}
            className="w-full h-full object-cover brightness-[0.8]" 
            alt="Mattress Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 md:bg-black/20" />
        </div>

        <div className="max-w-7xl mx-auto px-3 lg:px-8 py-3 relative z-10">
          {/* ===== TITLE ===== */}
          <div className="text-center">
            <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight">
              {t("mattress")}
            </h1>
            <p className="text-gray-200 mt-3 max-w-3xl mx-auto">
              {t("mattressHeroDesc")}
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-3 lg:px-8 pt-3 pb-8">

        {/* ===== BREADCRUMB ===== */}
        <nav className="flex text-lg items-center text-text-secondary mb-4">
          <Link to="/" className="hover:text-primary">{t("home")}</Link>
          <span className="mx-1.5 font-medium">›</span>
          <span className="font-medium">{t("mattress")}</span>
        </nav>

        {/* MOBILE BUTTON */}
        <div className="lg:hidden mb-4">
          <Button size="lg" className="!bg-bg" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal size={19} />
            {t("sort")} / {t("filters")}
          </Button>
        </div>

        <div className="flex gap-4">

          {/* ===== FILTER SIDEBAR ===== */}
          <aside className="hidden lg:block w-[280px]">
            <div className="bg-bg border border-border rounded-md p-5 sticky top-28">

              {/* TITLE */}
              <div className="flex text-text items-center gap-2 mb-6">
                <SlidersHorizontal size={18} />
                <span className="font-semibold text-lg">{t("filters")}</span>
              </div>

              {/* FILTER ITEMS */}
              <FilterItem
                title={t("price")}
                open={openFilter === "price"}
                onClick={() => toggle("price")}
              >
                <input type="range" className="w-full" />
              </FilterItem>

              <FilterItem
                title={t("discount")}
                open={openFilter === "discount"}
                onClick={() => toggle("discount")}
              >
                <input type="range" className="w-full" />
              </FilterItem>

              <FilterItem
                title={t("size")}
                open={openFilter === "size"}
                onClick={() => toggle("size")}
              >
                <Checkbox label="Single" />
                <Checkbox label="Double" />
                <Checkbox label="King" />
              </FilterItem>

              <FilterItem
                title={t("colors")}
                open={openFilter === "color"}
                onClick={() => toggle("color")}
              >
                <div className="flex gap-3">
                  <ColorDot color="bg-gray-300" />
                  <ColorDot color="bg-black" />
                  <ColorDot color="bg-yellow-200" />
                </div>
              </FilterItem>

            </div>
          </aside>

          {/* ===== RIGHT CONTENT ===== */}
          <section className="flex-1">

            {/* SORT */}
            <div className="hidden lg:flex justify-end mb-5">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-border px-4 pr-10 py-2 rounded-md
                    bg-bg text-text focus:outline-none cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>

                {/* CUSTOM ARROW */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
              {products.map(p => (
                <ProductCard key={p.id} {...p}/>
              ))}
            </div>
          </section>
        </div>

        {/* ===== MOBILE DRAWER ===== */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex">
            <div className="bg-bg w-[85%] p-5 overflow-y-auto">

              <h3 className="text-lg font-semibold mb-4">Sort & Filter</h3>

              {/* SORT */}
              <div className="mb-6">
                {sortOptions.map(opt => (
                  <label key={opt} className="flex gap-2 mb-2">
                    <input
                      type="radio"
                      checked={sort === opt}
                      onChange={() => setSort(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* FILTER */}
              <FilterItem title="Giá" open>
                <input type="range" className="w-full" />
              </FilterItem>

              <FilterItem title="Kích thước" open>
                <Checkbox label="Single" />
                <Checkbox label="Double" />
                <Checkbox label="King" />
              </FilterItem>

              <button
                onClick={() => setMobileOpen(false)}
                className="mt-6 w-full bg-primary text-white py-3 rounded-lg"
              >
                Apply
              </button>
            </div>

            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}
      </main>
    </MainLayout>
  );
}

/* ===== COMPONENTS ===== */

function FilterItem({ title, open, onClick, children }: any) {
  return (
    <div className="border-b border-border last:border-none py-4">
      <div
        onClick={onClick}
        className="flex justify-between items-center cursor-pointer"
      >
        <span className="font-semibold text-text">{title}</span>
        <ChevronDown
          size={18}
          className={clsx("transition-transform duration-200", open && "rotate-180")}
        />
      </div>

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function Checkbox({ label }: any) {
  return (
    <label className="flex items-center gap-2 text-text-secondary mb-2">
      <input type="checkbox" />
      {label}
    </label>
  );
}

function ColorDot({ color }: any) {
  return (
    <div className={clsx("w-6 h-6 rounded-full border border-border", color)} />
  );
}
