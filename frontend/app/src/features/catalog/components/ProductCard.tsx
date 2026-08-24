import { Link } from "react-router-dom";
import clsx from "clsx";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import type { ProductSummary } from "../model/catalogTypes";

type ProductCardProps = {
  product: ProductSummary;
  className?: string;
};

export default function ProductCard({ product, className }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  return (
    <Link
      to={`/products/${product.slug}`}
      className={clsx(
        "group block cursor-pointer overflow-hidden rounded-md bg-bg shadow-sm transition-shadow duration-500 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-square bg-bg-secondary">
        {product.discountPercentage !== null && product.discountPercentage > 0 && (
          <div className="absolute left-0 top-0 z-10 rounded-br-md bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
            -{product.discountPercentage}%
          </div>
        )}

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            className="pointer-events-none absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {t("imageUnavailable")}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-3 py-4">
        <p className="text-sm font-semibold text-text-secondary md:text-base">
          {product.categoryName}
        </p>

        <h3 className="line-clamp-2 text-base font-semibold text-text md:text-lg">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold text-red-700 md:text-xl">
            {currency.format(product.price)}
          </span>
          {product.originalPrice !== null && (
            <span className="text-sm font-medium text-text-tertiary line-through md:text-base">
              {currency.format(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-nowrap gap-2 text-xs font-medium text-primary md:text-sm">
          <span className="truncate whitespace-nowrap rounded-md bg-primary/8 px-1 py-0.5 md:px-2.5 md:py-1">
            {t("sizesCount").replace("{count}", String(product.numberSizes))}
          </span>
          <span className="truncate whitespace-nowrap rounded-md bg-primary/8 px-1 py-0.5 md:px-2.5 md:py-1">
            {t("colorsCount").replace("{count}", String(product.numberColors))}
          </span>
        </div>
      </div>
    </Link>
  );
}
