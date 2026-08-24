import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import {
  catalogColors,
  catalogPriceRanges,
  catalogSizes,
  formatPriceRange,
} from "../model/catalogFilters";

type FilterSidebarProps = {
  openFilters: string[];
  toggleFilter: (key: string) => void;
  selectedSizes: string[];
  selectedPrices: string[];
  selectedColors: string[];
  toggleSelection: (
    value: string,
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) => void;
  setSelectedSizes: Dispatch<SetStateAction<string[]>>;
  setSelectedPrices: Dispatch<SetStateAction<string[]>>;
  setSelectedColors: Dispatch<SetStateAction<string[]>>;
};

export default function FilterSidebar({
  openFilters,
  toggleFilter,
  selectedSizes,
  selectedPrices,
  selectedColors,
  toggleSelection,
  setSelectedSizes,
  setSelectedPrices,
  setSelectedColors,
}: FilterSidebarProps) {
  const { lang, t } = useLanguage();

  return (
    <aside className="hidden w-[310px] lg:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-md border border-border bg-bg p-5">
        <div className="mb-6 flex items-center gap-2 text-text-secondary">
          <SlidersHorizontal size={18} />
          <span className="text-lg font-semibold">{t("filters")}</span>
        </div>

        <FilterItem title={t("priceProduct")} open={openFilters.includes("price")} onClick={() => toggleFilter("price")}>
          {catalogPriceRanges.map((range) => (
            <FilterOption
              key={range.value}
              label={formatPriceRange(range, lang === "vi" ? "vi-VN" : "en-US")}
              selected={selectedPrices.includes(range.value)}
              onClick={() => toggleSelection(range.value, setSelectedPrices)}
            />
          ))}
        </FilterItem>

        <FilterItem title={t("size")} open={openFilters.includes("size")} onClick={() => toggleFilter("size")}>
          {catalogSizes.map((size) => (
            <FilterOption
              key={size}
              label={size}
              selected={selectedSizes.includes(size)}
              onClick={() => toggleSelection(size, setSelectedSizes)}
            />
          ))}
        </FilterItem>

        <FilterItem title={t("colors")} open={openFilters.includes("color")} onClick={() => toggleFilter("color")}>
          <div className="col-span-2 flex flex-wrap gap-3">
            {catalogColors.map((color) => (
              <ColorDot
                key={color.name}
                label={t(color.name as "white" | "gray" | "beige" | "cream" | "navy" | "black")}
                colorClass={color.className}
                selected={selectedColors.includes(color.name)}
                onClick={() => toggleSelection(color.name, setSelectedColors)}
              />
            ))}
          </div>
        </FilterItem>
      </div>
    </aside>
  );
}

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
    <div className="border-b border-border py-2 text-text-secondary last:border-none">
      <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center justify-between py-2 text-left">
        <span className="text-lg font-semibold">{title}</span>
        <ChevronDown size={18} className={clsx("transition-transform", open && "rotate-180")} />
      </button>
      <div className={clsx("overflow-hidden transition-all", open ? "mt-1 max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="grid grid-cols-2 gap-3">{children}</div>
      </div>
    </div>
  );
}

function FilterOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-lg border border-border px-1 py-2 text-sm font-medium transition-colors",
        selected ? "bg-primary text-white" : "hover:border-primary hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}

function ColorDot({
  label,
  colorClass,
  selected,
  onClick,
}: {
  label: string;
  colorClass: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx("flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-transform hover:scale-105", colorClass)}
      onClick={onClick}
    >
      {selected && <Check size={22} className="text-white drop-shadow" />}
    </button>
  );
}
