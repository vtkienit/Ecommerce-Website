import type { Dispatch, ReactNode, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import {
  catalogColors,
  catalogPriceRanges,
  catalogSizes,
  formatPriceRange,
} from "../model/catalogFilters";

type SortOption = { value: string; label: string };

type FilterMobileProps = {
  open: boolean;
  onClose: () => void;
  sort: string;
  setSort: (value: string) => void;
  sortOptions: SortOption[];
  clearAllFilters: () => void;
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
  selectedColors,
  toggleSelection,
  setSelectedSizes,
  setSelectedPrices,
  setSelectedColors,
}: FilterMobileProps) {
  const { lang, t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 text-text-secondary">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-bg p-5"
          >
            <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-border" />
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={19} />
                <span className="text-xl font-semibold">{t("filters")}</span>
              </div>
              <button type="button" onClick={onClose} aria-label="Close filters"><X size={28} /></button>
            </div>

            <MobileFilterItem title={t("sort")} open={openFilters.includes("sort")} onClick={() => toggleFilter("sort")} oneColumn>
              <div className="flex flex-col gap-4">
                {sortOptions.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <input type="radio" checked={sort === option.value} onChange={() => setSort(option.value)} />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </MobileFilterItem>

            <MobileFilterItem title={t("priceProduct")} open={openFilters.includes("price")} onClick={() => toggleFilter("price")}>
              {catalogPriceRanges.map((range) => (
                <FilterOption
                  key={range.value}
                  label={formatPriceRange(range, lang === "vi" ? "vi-VN" : "en-US")}
                  selected={selectedPrices.includes(range.value)}
                  onClick={() => toggleSelection(range.value, setSelectedPrices)}
                />
              ))}
            </MobileFilterItem>

            <MobileFilterItem title={t("size")} open={openFilters.includes("size")} onClick={() => toggleFilter("size")}>
              {catalogSizes.map((size) => (
                <FilterOption key={size} label={size} selected={selectedSizes.includes(size)} onClick={() => toggleSelection(size, setSelectedSizes)} />
              ))}
            </MobileFilterItem>

            <MobileFilterItem title={t("colors")} open={openFilters.includes("color")} onClick={() => toggleFilter("color")}>
              <div className="col-span-2 flex flex-wrap gap-3">
                {catalogColors.map((color) => (
                  <button
                    type="button"
                    key={color.name}
                    aria-label={color.name}
                    className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", color.className)}
                    onClick={() => toggleSelection(color.name, setSelectedColors)}
                  >
                    {selectedColors.includes(color.name) && <Check size={22} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </MobileFilterItem>

            <div className="flex justify-center">
              <button type="button" onClick={clearAllFilters} className="mt-7 rounded-xl border border-primary px-8 py-2.5 font-semibold text-primary">
                {t("clearAll")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MobileFilterItem({ title, open, onClick, children, oneColumn = false }: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
  oneColumn?: boolean;
}) {
  return (
    <div className="border-b border-border py-2">
      <button type="button" onClick={onClick} className="flex w-full items-center justify-between py-2 text-left">
        <span className="text-xl font-semibold">{title}</span>
        <ChevronDown size={22} className={clsx("transition-transform", open && "rotate-180")} />
      </button>
      <div className={clsx("overflow-hidden transition-all", open ? "mt-1 max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
        <div className={clsx("grid gap-3", oneColumn ? "grid-cols-1" : "grid-cols-2")}>{children}</div>
      </div>
    </div>
  );
}

function FilterOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={clsx("rounded-xl border border-border px-2 py-2 text-sm font-medium", selected && "bg-primary text-white")}>
      {label}
    </button>
  );
}
