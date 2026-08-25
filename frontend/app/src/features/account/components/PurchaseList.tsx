import { useEffect, useState } from "react";
import { LoaderCircle, PackageCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage, type TranslationKey } from "../../../app/contexts/LanguageContext";
import { cancelOrder, getOrders } from "../../commerce/api/commerceApi";
import type { Order, OrderStatus, PaymentStatus } from "../../commerce/model/commerceTypes";
import { SectionHeading } from "./AccountFormParts";

const statusKeys: Record<OrderStatus, TranslationKey> = {
  PENDING: "orderStatusPending",
  CONFIRMED: "orderStatusConfirmed",
  PROCESSING: "orderStatusProcessing",
  SHIPPED: "orderStatusShipped",
  DELIVERED: "orderStatusDelivered",
  CANCELLED: "orderStatusCancelled",
};

export type PurchaseFilter =
  | "all"
  | "pending"
  | "awaiting-shipment"
  | "shipping"
  | "completed"
  | "cancelled";

const filterStatuses: Record<PurchaseFilter, OrderStatus[]> = {
  all: [],
  pending: ["PENDING"],
  "awaiting-shipment": ["CONFIRMED", "PROCESSING"],
  shipping: ["SHIPPED"],
  completed: ["DELIVERED"],
  cancelled: ["CANCELLED"],
};

export default function PurchaseList({ filter = "all" }: { filter?: PurchaseFilter }) {
  const { lang, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const statuses = filterStatuses[filter];
  const visibleOrders = statuses.length === 0
    ? orders
    : orders.filter((order) => statuses.includes(order.status));

  useEffect(() => {
    let active = true;
    getOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("checkoutError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const cancel = async (orderId: number) => {
    setCancellingId(orderId);
    setError("");
    try {
      const updated = await cancelOrder(orderId);
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("checkoutError"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <SectionHeading title={t("purchaseTitle")} subtitle={t("purchaseSubtitle")} />
      {error && <p className="mx-4 mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300 sm:mx-6">{error}</p>}
      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-text-secondary">
          <LoaderCircle className="animate-spin text-primary" size={20} />
          {t("catalogLoading")}
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag size={34} />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-text">{t("noPurchases")}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            {t(filter === "all" ? "noPurchasesDescription" : "noPurchasesInStatus")}
          </p>
          <Link to="/mattress" className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            {t("startShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4 sm:p-6">
          {visibleOrders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-lg border border-border">
              <header className="flex flex-wrap items-center justify-between gap-3 bg-bg-secondary px-4 py-3 text-sm">
                <div>
                  <span className="font-semibold text-text">{t("orderNumber")}: {order.orderNumber}</span>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {t("orderedAt")}: {new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                  {t(statusKeys[order.status])}
                </span>
              </header>

              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <PackageCheck size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{item.productName}</p>
                      <p className="text-xs text-text-tertiary">{item.sku} · x{item.quantity}</p>
                    </div>
                    <span className="font-semibold text-text">{currency.format(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                <div className="text-sm text-text-secondary">
                  <p>{order.paymentMethod === "PAYOS" ? t("onlinePayment") : t("cashOnDelivery")} · {paymentLabel(order.paymentStatus, t)}</p>
                  {order.voucherCode && (
                    <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                      {order.voucherCode} · -{currency.format(order.discountAmount)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold text-red-700">{currency.format(order.totalAmount)}</span>
                  {order.paymentMethod === "PAYOS" && order.paymentStatus === "PENDING" && order.checkoutUrl && (
                    <a
                      href={order.checkoutUrl}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      {t("payNow")}
                    </a>
                  )}
                  {(order.status === "PENDING" || order.status === "CONFIRMED")
                    && !(order.paymentMethod === "PAYOS" && order.paymentStatus === "PAID") && (
                    <button
                      type="button"
                      disabled={cancellingId === order.id}
                      onClick={() => void cancel(order.id)}
                      className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      {cancellingId === order.id ? t("cancellingOrder") : t("cancelOrder")}
                    </button>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function statusClass(status: OrderStatus) {
  if (status === "DELIVERED") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-700 dark:text-red-300";
  return "bg-primary/10 text-primary";
}

function paymentLabel(
  status: PaymentStatus | null,
  t: (key: TranslationKey) => string,
) {
  if (status === "PAID") return t("paymentPaid");
  if (status === "CANCELLED") return t("paymentCancelled");
  if (status === "FAILED") return t("paymentFailed");
  if (status === "REFUNDED") return t("paymentRefunded");
  return t("paymentPending");
}
