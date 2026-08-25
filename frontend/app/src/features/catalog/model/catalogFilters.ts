export type PriceRange = {
  value: string;
  minPrice?: number;
  maxPrice?: number;
};

export const catalogPriceRanges: PriceRange[] = [
  { value: "50k-100k", minPrice: 50_000, maxPrice: 100_000 },
  { value: "100k-200k", minPrice: 100_000, maxPrice: 200_000 },
  { value: "200k-300k", minPrice: 200_000, maxPrice: 300_000 },
  { value: "300k-400k", minPrice: 300_000, maxPrice: 400_000 },
  { value: "400k-500k", minPrice: 400_000, maxPrice: 500_000 },
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
