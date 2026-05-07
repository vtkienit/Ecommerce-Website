import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal, X} from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../contexts/LanguageProvider";

type FilterMobileProps = {
  open: boolean;
  onClose: () => void;
  sort: string;
  setSort: (value: string) => void;
  sortOptions: string[];
  clearAllFilters: () => void;

  openFilters: string[];
  toggleFilter: (key: string) => void;

  selectedSizes: string[];
  selectedPrices: string[];
  selectedDiscounts: string[];
  selectedColors: string[];

  toggleSelection: (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => void;

  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedPrices: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedDiscounts: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
};

const discounts = [
  ">= 10%",
  ">= 25%",
  ">= 30%",
  ">= 40%",
  ">= 50%",
];

const sizes = [
  "16 x 60",
  "20 x 80",
  "32 x 50",
  "38 x 100",
  "40 x 58",
  "40 x 120",
  "45 x 65",
  "50 x 50",
  "120 x 190",
  "120 x 200",
  "140 x 200",
  "150 x 190",
  "150 x 210",
  "160 x 200",
  "180 x 200",
  "180 x 210",
  "190 x 215",
  "200 x 220",
];

const priceRanges = [
  "Dưới 500K",
  "500K - 1 triệu",
  "1 triệu - 1.5 triệu",
  "2 triệu - 5 triệu",
  "Trên 5 triệu",
];

const colors = [
  {
    name: "red",
    className: "bg-red-400",
  },
  {
    name: "yellow",
    className: "bg-yellow-400",
  },
  {
    name: "gray",
    className: "bg-gray-200",
  },
  {
    name: "indigo",
    className: "bg-indigo-500",
  },
  {
    name: "green",
    className: "bg-green-400",
  },
  {
    name: "pink",
    className: "bg-pink-400",
  },
  {
    name: "sky",
    className: "bg-sky-400",
  },
  {
    name: "black",
    className: "bg-black",
  },
];

export default function FilterMobile({
  open,
  onClose,
  sort,
  setSort,
  sortOptions,
  clearAllFilters,
  openFilters,
  toggleFilter,
  selectedSizes, 
  selectedPrices, 
  selectedDiscounts, 
  selectedColors, 
  toggleSelection, 
  setSelectedSizes, 
  setSelectedPrices, 
  setSelectedDiscounts, 
  setSelectedColors 
}: FilterMobileProps) {
  const { t } = useLanguage();
  
  return (
    <AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-50 text-text-secondary">

          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="
              absolute bottom-0 left-0 right-0
              bg-bg
              rounded-t-3xl
              p-5
              max-h-[85vh]
              overflow-y-auto
            "
          >

            {/* HANDLE */}
            <div className="w-14 h-1.5 bg-border rounded-full mx-auto mb-5" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={19} />
                <span className="font-semibold text-xl">
                  {t("filters")}
                </span>
              </div>

              <button onClick={onClose}>
                <X size={28} />
              </button>
            </div>

            {/* SORT */}
            <MobileFilterItem
              title={t("sort")}
              open={openFilters.includes("sort")}
              onClick={() => toggleFilter("sort")}
              className="!grid-cols-1"
            >
              <div className="flex flex-col gap-4 col-span-1">
                {sortOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" checked={sort === opt} onChange={() => setSort(opt)} />

                    <span className="font-medium"> {opt} </span>
                  </label>
                ))}
              </div>
            </MobileFilterItem>

            {/* PRICE */}
            <MobileFilterItem
              title={t("priceProduct")}
              open={openFilters.includes("price")}
              onClick={() => toggleFilter("price")}
            >
                {priceRanges.map(price => (
                    <FilterOption
                    key={price}
                    label={price}
                    selected={selectedPrices.includes(price)}
                    onClick={() =>
                        toggleSelection(
                        price,
                        selectedPrices,
                        setSelectedPrices
                        )
                    }
                    />
                ))}
            </MobileFilterItem>

            {/* Discount */}
            <MobileFilterItem
              title={t("discount")}
              open={openFilters.includes("discount")}
              onClick={() => toggleFilter("discount")}
            >
              {discounts.map(discount => (
                <FilterOption
                  key={discount}
                  label={discount}
                  selected={selectedDiscounts.includes(discount)}
                  onClick={() =>
                    toggleSelection(
                      discount,
                      selectedDiscounts,
                      setSelectedDiscounts
                    )
                  }
                />
              ))}
            </MobileFilterItem>

            {/* SIZE */}
            <MobileFilterItem
              title={t("size")}
              open={openFilters.includes("size")}
              onClick={() => toggleFilter("size")}
            >
                {sizes.map(size => (
                    <FilterOption
                    key={size}
                    label={size}
                    selected={selectedSizes.includes(size)}
                    onClick={() =>
                        toggleSelection(
                        size,
                        selectedSizes,
                        setSelectedSizes
                        )
                    }
                    />
                ))}
            </MobileFilterItem>

            {/* COLORS */}
            <MobileFilterItem
                title={t("colors")}
                open={openFilters.includes("color")}
                onClick={() => toggleFilter("color")}
            >
                <div className="flex flex-wrap gap-3 col-span-2">
                    {colors.map(color => (
                    <ColorDot
                        key={color.name}
                        colorClass={color.className}
                        selected={selectedColors.includes(color.name)}
                        onClick={() =>
                        toggleSelection(
                            color.name,
                            selectedColors,
                            setSelectedColors
                        )
                        }
                    />
                    ))}
                </div>
            </MobileFilterItem>

            <div className="flex justify-center">
                {/* CLEAR ALL */}
                <button
                    onClick={clearAllFilters}
                    className="mt-7 px-8 py-2.5 rounded-xl border border-primary bg-bg text-primary font-semibold 
                    transition-colors duration-200 active:bg-primary/20"
                >
                    {t("clearAll")}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ========================================================= */
function MobileFilterItem({
  title,
  open,
  onClick,
  children,
  className,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="border-b border-border py-2 text-text-secondary">

      <div onClick={onClick} className="flex items-center justify-between cursor-pointer py-2">
        <h3 className="font-semibold text-xl">
          {title}
        </h3>

        <ChevronDown size={22} className={clsx( "transition-transform duration-300", open && "rotate-180")}/>
      </div>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
        )}
      >
        <div className={clsx("grid grid-cols-2 gap-3", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
function FilterOption({ label, selected = false, onClick }: { label: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "py-2 rounded-xl border border-border text-sm font-medium transition-all duration-200 px-2 cursor-pointer",
        selected
          ? "bg-primary text-white"
          : ""
      )}
    >
      {label}
    </button>
  );
}

function ColorDot({ colorClass, selected = false, onClick }: { colorClass: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      className={clsx(
        "w-8 h-8 rounded-lg transition-transform duration-200 cursor-pointer flex items-center justify-center",
        colorClass,
        selected
          ? ""
          : "hover:scale-105"
      )}
      onClick={onClick}
    >
      {selected && (<Check size={24} className="text-white drop-shadow"/>)}
    </button>
  );
}