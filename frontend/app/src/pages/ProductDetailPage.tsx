import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { useLanguage } from "../app/contexts/LanguageContext";
import CatalogStatus from "../features/catalog/components/CatalogStatus";
import ProductCard from "../features/catalog/components/ProductCard";
import { useProduct } from "../features/catalog/hooks/useCatalog";
import type { ProductVariant } from "../features/catalog/model/catalogTypes";
import MainLayout from "../shared/layouts/MainLayout";
import { getAuthToken } from "../features/auth/model/authSession";
import { useCart } from "../features/commerce/context/CartContext";

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
  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId)
    || product?.variants[0];
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const originalPrice = selectedVariant?.originalPrice ?? product?.originalPrice;
  const discount = selectedVariant?.discountPercentage ?? product?.discountPercentage;
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
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
              <div className="mt-7">
                <h2 className="mb-3 font-semibold text-text">{t("productOptions")}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.variants.map((variant) => (
                    <VariantButton
                      key={variant.id}
                      variant={variant}
                      selected={(selectedVariant?.id ?? null) === variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center rounded-md border border-border bg-bg">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-full w-12 items-center justify-center text-text-secondary hover:text-primary"
                >
                  <Minus size={19} />
                </button>
                <span className="w-12 text-center font-semibold text-text">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="flex h-full w-12 items-center justify-center text-text-secondary hover:text-primary"
                >
                  <Plus size={19} />
                </button>
              </div>
              <button
                type="button"
                disabled={!selectedVariant || isAdding}
                onClick={() => void handleAddToCart()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-white transition hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
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

function VariantButton({
  variant,
  selected,
  onClick,
}: {
  variant: ProductVariant;
  selected: boolean;
  onClick: () => void;
}) {
  const details = [variant.size, variant.thickness, variant.color].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-3 text-left transition ${
        selected
          ? "border-primary bg-primary/8 text-primary"
          : "border-border bg-bg text-text-secondary hover:border-primary/50"
      }`}
    >
      <span className="block font-semibold">{details.join(" · ") || variant.sku}</span>
      <span className="mt-1 block text-xs opacity-70">{variant.sku}</span>
    </button>
  );
}
