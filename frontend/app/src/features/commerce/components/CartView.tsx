import { useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LoaderCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import MainLayout from "../../../shared/layouts/MainLayout";
import { getStoredUser } from "../../auth/model/authSession";
import { checkout } from "../api/commerceApi";
import { useCart } from "../context/CartContext";

export default function CartView() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const user = getStoredUser();
  const { cart, isLoading, error: cartError, refreshCart, updateItem, removeItem } = useCart();
  const [recipientName, setRecipientName] = useState(user?.name ?? "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone ?? "");
  const [shippingAddress, setShippingAddress] = useState(user?.address ?? "");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  if (!user) {
    return <Navigate to="/login?returnTo=/cart" replace />;
  }

  const changeQuantity = async (itemId: number, quantity: number) => {
    setActionError("");
    try {
      await updateItem(itemId, quantity);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : t("checkoutError"));
    }
  };

  const remove = async (itemId: number) => {
    setActionError("");
    try {
      await removeItem(itemId);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : t("checkoutError"));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cart.items.length === 0 || isSubmitting) return;

    setActionError("");
    setIsSubmitting(true);
    try {
      await checkout({
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: "COD",
      });
      await refreshCart();
      navigate("/purchases", { replace: true });
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : t("checkoutError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Helmet><title>{t("shoppingCart")} | QuyDung</title></Helmet>
      <main className="min-h-[65vh] bg-bg-subtle px-3 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">QuyDung</p>
              <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("shoppingCart")}</h1>
            </div>
            <Link to="/mattress" className="text-sm font-semibold text-primary hover:underline">
              {t("continueShopping")}
            </Link>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={20} />
              {t("cartLoading")}
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-border bg-bg p-8 text-center shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag size={34} />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-text">{t("emptyCart")}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">{t("emptyCartDescription")}</p>
              <Link to="/mattress" className="mt-6 rounded-md bg-primary px-5 py-2.5 font-semibold text-white">
                {t("continueShopping")}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <section className="space-y-3">
                {cart.items.map((item) => (
                  <article key={item.id} className="flex gap-4 rounded-xl border border-border bg-bg p-4 shadow-sm sm:p-5">
                    <Link to={`/products/${item.productSlug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-bg-secondary sm:h-36 sm:w-36">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-text-muted">{t("imageUnavailable")}</div>
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link to={`/products/${item.productSlug}`} className="font-semibold text-text hover:text-primary sm:text-lg">
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-text-tertiary">{[item.size, item.thickness, item.color].filter(Boolean).join(" · ")}</p>
                      <p className="mt-3 font-bold text-red-700">{currency.format(item.unitPrice)}</p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        <div className="flex h-9 items-center rounded-md border border-border">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => void changeQuantity(item.id, item.quantity - 1)}
                            className="flex h-full w-9 items-center justify-center disabled:opacity-35"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={item.quantity >= 99}
                            onClick={() => void changeQuantity(item.id, item.quantity + 1)}
                            className="flex h-full w-9 items-center justify-center disabled:opacity-35"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={t("remove")}
                          onClick={() => void remove(item.id)}
                          className="rounded-md p-2 text-text-tertiary hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="h-fit rounded-xl border border-border bg-bg p-5 shadow-sm lg:sticky lg:top-28 sm:p-6">
                <h2 className="text-xl font-semibold text-text">{t("orderSummary")}</h2>
                <div className="mt-5 space-y-4">
                  <CheckoutField label={t("recipientName")} value={recipientName} onChange={setRecipientName} />
                  <CheckoutField label={t("recipientPhone")} value={recipientPhone} onChange={setRecipientPhone} />
                  <label className="block text-sm font-medium text-text-secondary">
                    {t("shippingAddress")}
                    <textarea
                      required
                      value={shippingAddress}
                      onChange={(event) => setShippingAddress(event.target.value)}
                      className="mt-2 min-h-24 w-full resize-y rounded-md border border-border bg-bg px-3 py-2.5 text-text outline-none focus:border-primary"
                    />
                  </label>
                  <div className="rounded-md bg-bg-secondary p-3 text-sm text-text-secondary">
                    <span className="font-semibold text-text">{t("cashOnDelivery")}</span>
                  </div>
                </div>

                <div className="my-5 border-t border-border" />
                <div className="flex items-center justify-between text-text-secondary">
                  <span>{t("subtotal")}</span>
                  <span className="text-xl font-bold text-text">{currency.format(cart.subtotal)}</span>
                </div>
                {(actionError || cartError) && (
                  <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{actionError || cartError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white disabled:opacity-60"
                >
                  {isSubmitting && <LoaderCircle className="animate-spin" size={18} />}
                  {isSubmitting ? t("processingOrder") : t("placeOrder")}
                </button>
              </aside>
            </form>
          )}
        </div>
      </main>
    </MainLayout>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-text-secondary">
      {label}
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-text outline-none focus:border-primary"
      />
    </label>
  );
}
