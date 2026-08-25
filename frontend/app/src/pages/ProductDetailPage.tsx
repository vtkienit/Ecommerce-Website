import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import { useLanguage } from "../app/contexts/LanguageContext";
import CatalogStatus from "../features/catalog/components/CatalogStatus";
import ProductCard from "../features/catalog/components/ProductCard";
import { useProduct } from "../features/catalog/hooks/useCatalog";
import type { ProductVariant } from "../features/catalog/model/catalogTypes";
import MainLayout from "../shared/layouts/MainLayout";
import { getAuthToken } from "../features/auth/model/authSession";
import { useCart } from "../features/commerce/context/CartContext";
import { useVariantAvailability } from "../features/commerce/hooks/useVariantAvailability";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const { data: product, isLoading, error } = useProduct(slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const variantIds = product?.variants.map((variant) => variant.id) ?? [];
  const availability = useVariantAvailability(variantIds);
  const requestedVariant = product?.variants.find((variant) => variant.id === selectedVariantId)
    || product?.variants[0];
  const firstAvailableVariant = !availability.isLoading && !availability.error
    ? product?.variants.find((variant) => (availability.quantities[variant.id] ?? 0) > 0)
    : undefined;
  const selectedVariant = requestedVariant
    && (availability.isLoading
      || Boolean(availability.error)
      || (availability.quantities[requestedVariant.id] ?? 0) > 0)
    ? requestedVariant
    : firstAvailableVariant || requestedVariant;
  const selectedSize = selectedVariant?.size ?? "";
  const variantsForSelectedSize = product?.variants.filter(
    (variant) => (variant.size ?? "") === selectedSize,
  ) ?? [];
  const sizeOptions = product
    ? [...new Map(product.variants.map((variant) => [variant.size ?? "", variant])).values()]
    : [];
  const selectedAvailableQuantity = selectedVariant
    ? availability.quantities[selectedVariant.id]
    : undefined;
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const originalPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount = selectedVariant?.discountPercentage ?? product?.discountPercentage;
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    setQuantity(1);
    setCartMessage("");
    setCartError("");
  };

  const selectSize = (size: string) => {
    if (!product) return;
    const matchingVariants = product.variants.filter((variant) => (variant.size ?? "") === size);
    const sameColor = matchingVariants.find(
      (variant) => variant.color === selectedVariant?.color
        && (availability.quantities[variant.id] ?? 0) > 0,
    );
    const availableVariant = matchingVariants.find(
      (variant) => (availability.quantities[variant.id] ?? 0) > 0,
    );
    selectVariant(sameColor || availableVariant || matchingVariants[0]);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (selectedAvailableQuantity === undefined || availability.error) {
      setCartError(t("stockUnavailable"));
      return;
    }
    if (selectedAvailableQuantity < quantity) {
      setCartError(t("quantityCannotExceedStock"));
      return;
    }
    if (!getAuthToken()) {
      navigate(`/login?returnTo=/products/${slug}`);
      return;
    }

    setIsAdding(true);
    setCartMessage("");
    setCartError("");
    try {
      await addItem(selectedVariant.id, quantity);
      setCartMessage(t("cartAdded"));
    } catch (requestError) {
      setCartError(requestError instanceof Error ? requestError.message : t("addToCartFailed"));
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading || error || !product) {
    return (
      <MainLayout>
        <Helmet><title>{t("productNotFound")} | QuyDung</title></Helmet>
        <CatalogStatus loading={isLoading} error={error} empty={!isLoading && !error && !product} />
      </MainLayout>
    );
  }

  const selectedImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <MainLayout>
      <Helmet>
        <title>{product.name} | QuyDung</title>
        {product.description && <meta name="description" content={product.description} />}
      </Helmet>

      <main className="mx-auto max-w-7xl px-3 py-6 lg:px-8 lg:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <Link to="/" className="hover:text-primary">{t("home")}</Link>
          <span>/</span>
          <Link to={`/catalog/${product.categorySlug}`} className="hover:text-primary">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-bg-secondary">
              {discount !== null && discount !== undefined && discount > 0 && (
                <span className="absolute left-0 top-0 z-10 rounded-br-md bg-red-500 px-4 py-2 font-bold text-white">
                  -{discount}%
                </span>
              )}
              {selectedImage ? (
                <img
                  src={selectedImage.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  {t("imageUnavailable")}
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 bg-bg-secondary transition ${
                      index === selectedImageIndex ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              {product.categoryName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-text md:text-5xl">{product.name}</h1>
            {product.brand && <p className="mt-2 text-text-secondary">{product.brand}</p>}

            <div className="mt-6 flex flex-wrap items-end gap-3 border-b border-border pb-6">
              <span className="text-3xl font-bold text-red-700">{currency.format(price)}</span>
              {originalPrice !== null && originalPrice !== undefined && originalPrice > price && (
                <span className="pb-1 text-lg text-text-tertiary line-through">
                  {currency.format(originalPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 leading-7 text-text-secondary">{product.description}</p>
            )}

            {product.variants.length > 0 && (
              <div className="mt-7 space-y-6">
                <div>
                  <h2 className="mb-3 font-semibold text-text">{t("selectSize")}</h2>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((variant) => {
                      const size = variant.size ?? "";
                      const variantsWithSize = product.variants.filter(
                        (item) => (item.size ?? "") === size,
                      );
                      const outOfStock = !availability.isLoading
                        && !availability.error
                        && variantsWithSize.every(
                          (item) => (availability.quantities[item.id] ?? 0) === 0,
                        );

                      return (
                        <button
                          key={size || variant.id}
                          type="button"
                          disabled={outOfStock}
                          onClick={() => selectSize(size)}
                          className={`min-w-32 cursor-pointer rounded-md border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                            selectedSize === size
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
                          }`}
                        >
                          <span className="block font-semibold">{size || t("default")}</span>
                          {variant.thickness && (
                            <span className="mt-1 block text-xs opacity-75">
                              {t("thickness")}: {variant.thickness}
                            </span>
                          )}
                          {outOfStock && <span className="mt-1 block text-xs text-red-600">{t("outOfStock")}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 font-semibold text-text">{t("selectColor")}</h2>
                  <div className="flex flex-wrap gap-2">
                    {variantsForSelectedSize.map((variant) => {
                      const outOfStock = !availability.isLoading
                        && !availability.error
                        && (availability.quantities[variant.id] ?? 0) === 0;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={outOfStock}
                          onClick={() => selectVariant(variant)}
                          className={`min-w-28 cursor-pointer rounded-md border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                            selectedVariant?.id === variant.id
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border bg-bg text-text-secondary hover:border-primary/50 hover:text-text"
                          }`}
                        >
                          <span className="block font-semibold capitalize">{variant.color || t("default")}</span>
                          <span className="mt-1 block text-xs opacity-70">{variant.sku}</span>
                          {outOfStock && <span className="mt-1 block text-xs text-red-600">{t("outOfStock")}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {availability.isLoading
                      ? <LoaderCircle className="animate-spin" size={20} />
                      : <PackageCheck size={21} />}
                  </span>
                  <div>
                    <p className="text-sm text-text-secondary">{t("stockAvailable")}</p>
                    {availability.isLoading && <p className="font-semibold text-text">{t("stockLoading")}</p>}
                    {!availability.isLoading && availability.error && (
                      <p className="font-semibold text-red-600">{t("stockUnavailable")}</p>
                    )}
                    {!availability.isLoading && !availability.error && selectedAvailableQuantity !== undefined && (
                      <p className={`font-semibold ${selectedAvailableQuantity > 0 ? "text-green-700 dark:text-green-300" : "text-red-600"}`}>
                        {selectedAvailableQuantity > 0
                          ? t("itemsAvailable").replace("{count}", String(selectedAvailableQuantity))
                          : t("outOfStock")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center rounded-md border border-border bg-bg">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  className="flex h-full w-12 cursor-pointer items-center justify-center text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={19} />
                </button>
                <span className="w-12 text-center font-semibold text-text">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => Math.min(selectedAvailableQuantity ?? current, current + 1))}
                  disabled={selectedAvailableQuantity === undefined || quantity >= selectedAvailableQuantity}
                  className="flex h-full w-12 cursor-pointer items-center justify-center text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={19} />
                </button>
              </div>
              <button
                type="button"
                disabled={!selectedVariant || isAdding || availability.isLoading || Boolean(availability.error) || !selectedAvailableQuantity}
                onClick={() => void handleAddToCart()}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-white transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAdding ? <LoaderCircle className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                {t("addToCart")}
              </button>
            </div>
            {cartMessage && (
              <p className="mt-3 flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 size={17} /> {cartMessage}
              </p>
            )}
            {cartError && (
              <p className="mt-3 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{cartError}</p>
            )}
          </section>
        </div>

        {product.relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 text-2xl font-semibold text-text md:text-4xl">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {product.relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
    </MainLayout>
  );
}
