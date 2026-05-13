import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageProvider";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import bannerImg from "../assets/images/mattress_banner.png"
import clsx from "clsx";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import FilterSidebar from "../components/FilterSidebar";
import FilterMobile from "../components/FilterMobile";

/* ===== MOCK DATA (reuse style Home) ===== */
const products = [
  {
    id: 1,
    title: 'Linen Duvet Set',
    price: 189.0,
    originalPrice: 270.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    category: 'Linen Collection',
    numberSizes: 3,
    numberColors: 5,
  },
  {
    id: 2,
    title: 'Bamboo Silk Pillowcase',
    price: 45.0,
    originalPrice: 65.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Silk Collection',
    numberSizes: 2,
    numberColors: 3,
  },
  {
    id: 3,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology',
    numberSizes: 4,
    numberColors: 6,
  },
  {
    id: 4,
    title: 'Cloud Orthopedic Pad',
    price: 320.0,
    originalPrice: 450.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Mattress Technology',
    numberSizes: 5,
    numberColors: 3,
  },
    {
    id: 5,
    title: 'Linen Duvet Set',
    price: 189.0,
    originalPrice: 270.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
    category: 'Linen Collection',
    numberSizes: 3,
    numberColors: 5,
  },
  {
    id: 6,
    title: 'Bamboo Silk Pillowcase',
    price: 45.0,
    originalPrice: 65.0,
    discount: '-30%',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600',
    category: 'Silk Collection',
    numberSizes: 2,
    numberColors: 3,
  },
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
  const [openFilters, setOpenFilters] = useState<string[]>(["price", "discount", "color"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleFilter = (key: string) => {
    setOpenFilters(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSelectedColors([]);
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
            <h1 className="text-4xl md:text-7xl font-semibold text-white tracking-tight">
              {t("mattress")}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mt-3 max-w-3xl mx-auto">
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
          <button className="flex gap-2 items-center border border-border px-3 py-2 rounded-md text-text-secondary bg-bg" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal size={19} />
            {t("sort")} / {t("filters")}
          </button>
        </div>

        <div className="flex gap-4">

          {/* ===== FILTER SIDEBAR ===== */}
          <FilterSidebar
            openFilters={openFilters}
            toggleFilter={toggleFilter}

            selectedSizes={selectedSizes}
            selectedPrices={selectedPrices}
            selectedDiscounts={selectedDiscounts}
            selectedColors={selectedColors}

            toggleSelection={toggleSelection}

            setSelectedSizes={setSelectedSizes}
            setSelectedPrices={setSelectedPrices}
            setSelectedDiscounts={setSelectedDiscounts}
            setSelectedColors={setSelectedColors}
          />

          {/* ===== RIGHT CONTENT ===== */}
          <section className="flex-1">

            {/* SORT */}
            <div className="hidden lg:flex justify-end mb-5">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-border px-4 pr-10 py-2 rounded-md
                    bg-bg text-text-secondary focus:outline-none cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>

                {/* CUSTOM ARROW */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <ChevronDown size={18} className="text-text-secondary" />
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
        <FilterMobile
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}

          sort={sort}
          setSort={setSort}
          sortOptions={sortOptions}

          clearAllFilters={clearAllFilters}

          openFilters={openFilters}
          toggleFilter={toggleFilter}

          selectedSizes={selectedSizes}
          selectedPrices={selectedPrices}
          selectedDiscounts={selectedDiscounts}
          selectedColors={selectedColors}

          toggleSelection={toggleSelection}

          setSelectedSizes={setSelectedSizes}
          setSelectedPrices={setSelectedPrices}
          setSelectedDiscounts={setSelectedDiscounts}
          setSelectedColors={setSelectedColors}
        />

      </main>
    </MainLayout>
  );
}