import clsx from "clsx";
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { useLanguage } from "../contexts/LanguageProvider";
import type { ReactNode } from "react";

type FilterSidebarProps = {
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

export default function FilterSidebar({ 
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
  }: FilterSidebarProps) {
  const { t } = useLanguage();

  return (
    <aside className="hidden lg:block w-[310px]">
      <div className="bg-bg border border-border rounded-md p-5 sticky top-28 max-h-[908px] overflow-y-auto">

        {/* TITLE */}
        <div className="flex text-text-secondary items-center gap-2 mb-6">
          <SlidersHorizontal size={18} />
          <span className="font-semibold text-lg">
            {t("filters")}
          </span>
        </div>

        {/* PRICE */}
        <FilterItem
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
        </FilterItem>

        {/* DISCOUNT */}
        <FilterItem
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
        </FilterItem>

        {/* SIZE */}
        <FilterItem
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
        </FilterItem>

        {/* COLORS */}
        <FilterItem
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
        </FilterItem>
      </div>
    </aside>
  );
}

/* ========================================================= */

function FilterItem({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-none py-2 text-text-secondary">

      {/* HEADER */}
      <div onClick={onClick} className="flex justify-between items-start cursor-pointer py-2">
        <div>
          <h3 className="font-semibold text-xl">
            {title}
          </h3>
        </div>

        <ChevronDown size={18} className={clsx("text-text-secondary transition-transform duration-200", open && "rotate-180")}/>
      </div>

      {/* CONTENT */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-2 gap-3">
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
        "py-2 rounded-lg border border-border text-sm font-medium transition-colors duration-200 px-1 cursor-pointer",
        selected
          ? "bg-primary text-white"
          : "hover:border-primary hover:text-primary"
      )}
    >
      {label}
    </button>
  );
}

/* ========================================================= */

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