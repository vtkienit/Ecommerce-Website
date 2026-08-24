export type PriceRange = {
  value: string;
  minPrice?: number;
  maxPrice?: number;
};

export const catalogPriceRanges: PriceRange[] = [
  { value: "under-500k", maxPrice: 500_000 },
  { value: "500k-1m", minPrice: 500_000, maxPrice: 1_000_000 },
  { value: "1m-2m", minPrice: 1_000_000, maxPrice: 2_000_000 },
  { value: "2m-5m", minPrice: 2_000_000, maxPrice: 5_000_000 },
  { value: "over-5m", minPrice: 5_000_000 },
];

export const catalogSizes = [
  "40 x 60",
  "50 x 70",
  "150 x 200",
  "160 x 200",
  "180 x 200",
  "180 x 210",
  "200 x 220",
];

export const catalogColors = [
  { name: "white", className: "bg-white border border-gray-300" },
  { name: "gray", className: "bg-gray-400" },
  { name: "beige", className: "bg-amber-100" },
  { name: "cream", className: "bg-yellow-50 border border-gray-300" },
  { name: "navy", className: "bg-blue-950" },
  { name: "black", className: "bg-black" },
];

export function getPriceBounds(selectedRanges: string[]) {
  const ranges = catalogPriceRanges.filter((range) => selectedRanges.includes(range.value));

  if (ranges.length === 0) {
    return {};
  }

  const minimums = ranges
    .map((range) => range.minPrice)
    .filter((price): price is number => price !== undefined);
  const maximums = ranges
    .map((range) => range.maxPrice)
    .filter((price): price is number => price !== undefined);

  return {
    minPrice: minimums.length === ranges.length ? Math.min(...minimums) : undefined,
    maxPrice: maximums.length === ranges.length ? Math.max(...maximums) : undefined,
  };
}

export function formatPriceRange(range: PriceRange, locale: string) {
  const formatter = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  if (range.minPrice === undefined) {
    return `< ${formatter.format(range.maxPrice ?? 0)}₫`;
  }

  if (range.maxPrice === undefined) {
    return `> ${formatter.format(range.minPrice)}₫`;
  }

  return `${formatter.format(range.minPrice)}₫ - ${formatter.format(range.maxPrice)}₫`;
}
