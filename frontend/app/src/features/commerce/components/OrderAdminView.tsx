import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { LoaderCircle, PackageOpen, Search, UserRound } from "lucide-react";
import { useLanguage, type TranslationKey } from "../../../app/contexts/LanguageContext";
import MainLayout from "../../../shared/layouts/MainLayout";
import { getStoredUser } from "../../auth/model/authSession";
import { getAdminOrders, updateOrderStatus } from "../api/commerceApi";
import type { Order, OrderStatus } from "../model/commerceTypes";

type StatusFilter = "ALL" | OrderStatus;

const statuses: StatusFilter[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusKeys: Record<OrderStatus, TranslationKey> = {
  PENDING: "orderStatusPending",
  CONFIRMED: "orderStatusConfirmed",
  PROCESSING: "orderStatusProcessing",
  SHIPPED: "orderStatusShipped",
  DELIVERED: "orderStatusDelivered",
  CANCELLED: "orderStatusCancelled",
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const actionKeys: Partial<Record<OrderStatus, TranslationKey>> = {
  CONFIRMED: "confirmOrder",
  PROCESSING: "processOrder",
  SHIPPED: "shipOrder",
  DELIVERED: "completeOrder",
};

export default function OrderAdminView() {
  const { lang, t } = useLanguage();
  const user = getStoredUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role.toLowerCase() !== "admin") return;

    let active = true;
    getAdminOrders(filter === "ALL" ? undefined : filter)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("orderAdminError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter, t, user?.role]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((order) =>
      [order.orderNumber, order.recipientName, order.recipientPhone, String(order.userId)]
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [orders, search]);

  if (!user) {
    return <Navigate to="/login?returnTo=/admin/orders" replace />;
  }

  if (user.role.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const changeStatus = async (order: Order, target: OrderStatus) => {
    if (target === "CANCELLED" && !window.confirm(t("adminCancelOrderConfirm"))) return;

    setUpdatingId(order.id);
    setError("");
    setSuccess("");
    try {
      const updated = await updateOrderStatus(order.id, target);
      setOrders((current) => filter !== "ALL"
        ? current.filter((item) => item.id !== order.id)
        : current.map((item) => item.id === order.id ? updated : item));
      setSuccess(t("orderStatusUpdated"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("orderAdminError"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout>
      <Helmet><title>{t("orderManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[65vh] bg-bg-subtle px-3 py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("orderManagement")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("orderManagementDescription")}</p>
          </header>

          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex items-center gap-3 rounded-lg border border-border bg-bg px-4 shadow-sm">
              <Search size={19} className="text-text-tertiary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchOrders")}
                className="h-12 min-w-0 flex-1 bg-transparent text-text outline-none"
              />
              <span className="text-sm text-text-tertiary">{filteredOrders.length}</span>
            </label>
            <select
              value={filter}
              onChange={(event) => {
                setIsLoading(true);
                setError("");
                setFilter(event.target.value as StatusFilter);
              }}
              className="h-12 rounded-lg border border-border bg-bg px-4 font-medium text-text outline-none focus:border-primary"
              aria-label={t("filterOrderStatus")}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? t("allOrders") : t(statusKeys[status])}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          {success && <p className="mt-4 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={21} /> {t("orderAdminLoading")}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg text-center">
              <PackageOpen size={38} className="text-text-tertiary" />
              <p className="mt-3 text-text-secondary">{t("orderAdminEmpty")}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredOrders.map((order) => {
                const awaitingOnlinePayment = order.paymentMethod === "PAYOS" && order.paymentStatus !== "PAID";
                const target = awaitingOnlinePayment ? undefined : nextStatus[order.status];
                const canCancel = ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)
                  && !(order.paymentMethod === "PAYOS" && order.paymentStatus === "PAID");
                return (
                  <article key={order.id} className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-bg-secondary px-4 py-4 sm:px-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-text">#{order.orderNumber}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                            {t(statusKeys[order.status])}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-text-tertiary">{dateTime.format(new Date(order.createdAt))}</p>
                      </div>
                      <p className="text-lg font-bold text-red-700 dark:text-red-400">{currency.format(order.totalAmount)}</p>
                    </header>

                    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(300px,1.2fr)]">
                      <section>
                        <div className="flex items-center gap-2 font-semibold text-text">
                          <UserRound size={18} className="text-primary" /> {order.recipientName}
                        </div>
                        <p className="mt-2 text-sm text-text-secondary">{order.recipientPhone}</p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">{order.shippingAddress}</p>
                        <p className="mt-2 text-xs text-text-tertiary">{t("customerId")}: {order.userId}</p>
                      </section>

                      <section className="divide-y divide-border rounded-lg border border-border">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-text">{item.productName}</p>
                              <p className="text-xs text-text-tertiary">{item.sku} · x{item.quantity}</p>
                            </div>
                            <span className="shrink-0 font-semibold text-text">{currency.format(item.lineTotal)}</span>
                          </div>
                        ))}
                      </section>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
                      <div className="text-sm text-text-secondary">
                        <p>{order.paymentMethod === "PAYOS" ? t("onlinePayment") : t("cashOnDelivery")} · {paymentLabel(order, t)}</p>
                        {order.voucherCode && (
                          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                            {order.voucherCode} · -{currency.format(order.discountAmount)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {canCancel && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => void changeStatus(order, "CANCELLED")}
                            className="rounded-md border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
                          >
                            {t("cancelOrder")}
                          </button>
                        )}
                        {target && (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => void changeStatus(order, target)}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {updatingId === order.id && <LoaderCircle className="animate-spin" size={16} />}
                            {t(actionKeys[target] ?? "saveChanges")}
                          </button>
                        )}
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}

function statusClass(status: OrderStatus) {
  if (status === "DELIVERED") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-700 dark:text-red-300";
  if (status === "SHIPPED") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "bg-primary/10 text-primary";
}

function paymentLabel(order: Order, t: (key: TranslationKey) => string) {
  if (order.paymentStatus === "PAID") return t("paymentPaid");
  if (order.paymentStatus === "CANCELLED") return t("paymentCancelled");
  return t("paymentPending");
}
