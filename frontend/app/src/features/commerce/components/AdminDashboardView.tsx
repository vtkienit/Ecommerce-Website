import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  Clock3,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage, type TranslationKey } from "../../../app/contexts/LanguageContext";
import { getAdminDashboard } from "../api/commerceApi";
import type { AdminDashboard, DashboardOrder, OrderStatus } from "../model/commerceTypes";

const orderStatuses: OrderStatus[] = [
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

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-violet-500",
  SHIPPED: "bg-cyan-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export default function AdminDashboardView() {
  const { lang, t } = useLanguage();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("dashboardLoadError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey, t]);

  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <Helmet><title>{t("adminDashboard")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("adminDashboard")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("dashboardDescription")}</p>
          </header>

          {isLoading ? (
            <DashboardLoading label={t("dashboardLoading")} />
          ) : error || !dashboard ? (
            <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg p-6 text-center shadow-sm">
              <AlertTriangle size={38} className="text-amber-500" />
              <p className="mt-3 text-text-secondary">{error || t("dashboardLoadError")}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError("");
                  setReloadKey((current) => current + 1);
                }}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:brightness-95"
              >
                <RefreshCw size={17} /> {t("tryAgain")}
              </button>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Banknote}
                  label={t("monthlyRevenue")}
                  value={currency.format(dashboard.monthlyRevenue)}
                  detail={`${t("totalRevenue")}: ${currency.format(dashboard.totalRevenue)}`}
                  iconClass="bg-green-500/10 text-green-700 dark:text-green-300"
                />
                <MetricCard
                  icon={ShoppingBag}
                  label={t("totalOrders")}
                  value={dashboard.totalOrders.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}
                  detail={t("allOrders")}
                  iconClass="bg-blue-500/10 text-blue-700 dark:text-blue-300"
                />
                <MetricCard
                  icon={Clock3}
                  label={t("pendingOrders")}
                  value={dashboard.pendingOrders.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}
                  detail={t("orderStatusPending")}
                  iconClass="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                />
                <MetricCard
                  icon={Boxes}
                  label={t("lowStockVariants")}
                  value={dashboard.lowStockVariants.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}
                  detail={t("lowStockThreshold")}
                  iconClass="bg-red-500/10 text-red-700 dark:text-red-300"
                />
              </section>

              <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                <DashboardPanel
                  title={t("recentOrders")}
                  action={<PanelLink to="/admin/orders" label={t("viewAll")} />}
                >
                  {dashboard.recentOrders.length === 0 ? (
                    <EmptyPanel icon={<ShoppingBag size={32} />} label={t("noRecentOrders")} />
                  ) : (
                    <div className="divide-y divide-border">
                      {dashboard.recentOrders.map((order) => (
                        <RecentOrderRow
                          key={order.id}
                          order={order}
                          currency={currency}
                          dateTime={dateTime}
                          statusLabel={t(statusKeys[order.status])}
                        />
                      ))}
                    </div>
                  )}
                </DashboardPanel>

                <DashboardPanel
                  title={t("orderOverview")}
                  action={<PanelLink to="/admin/orders" label={t("manageOrders")} />}
                >
                  <StatusOverview dashboard={dashboard} />
                </DashboardPanel>
              </section>

              <DashboardPanel
                title={t("lowStockWarning")}
                action={<PanelLink to="/admin/inventory" label={t("inventoryManagement")} />}
              >
                {dashboard.lowStockItems.length === 0 ? (
                  <EmptyPanel icon={<PackageCheck size={34} />} label={t("inventoryHealthy")} />
                ) : (
                  <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
                    {dashboard.lowStockItems.map((item) => (
                      <article key={item.variantId} className="rounded-lg border border-border bg-bg-secondary p-4">
                        <p className="truncate font-semibold text-text">{item.sku}</p>
                        <p className="mt-1 text-xs text-text-tertiary">Variant #{item.variantId}</p>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <span className="text-sm text-text-secondary">{t("stockAvailable")}</span>
                          <strong className="text-2xl text-red-600 dark:text-red-400">{item.availableQuantity}</strong>
                        </div>
                        <p className="mt-2 text-xs text-text-tertiary">
                          {t("stockOnHand")}: {item.onHandQuantity} · {t("stockReserved")}: {item.reservedQuantity}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </DashboardPanel>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, detail, iconClass }: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  iconClass: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-bg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-text">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconClass}`}>
          <Icon size={21} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 truncate border-t border-border pt-3 text-xs text-text-tertiary">{detail}</p>
    </article>
  );
}

function DashboardPanel({ title, action, children }: {
  title: string;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <h2 className="font-semibold text-text">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function PanelLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
      {label} <ArrowRight size={15} />
    </Link>
  );
}

function RecentOrderRow({ order, currency, dateTime, statusLabel }: {
  order: DashboardOrder;
  currency: Intl.NumberFormat;
  dateTime: Intl.DateTimeFormat;
  statusLabel: string;
}) {
  return (
    <Link to="/admin/orders" className="grid gap-3 px-4 py-4 no-underline transition-colors hover:bg-bg-secondary sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-5">
      <div className="min-w-0">
        <p className="truncate font-semibold text-text">#{order.orderNumber}</p>
        <p className="mt-1 truncate text-xs text-text-tertiary">{order.recipientName} · {dateTime.format(new Date(order.createdAt))}</p>
      </div>
      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
        {statusLabel}
      </span>
      <strong className="text-sm text-text sm:text-right">{currency.format(order.totalAmount)}</strong>
    </Link>
  );
}

function StatusOverview({ dashboard }: { dashboard: AdminDashboard }) {
  const { t } = useLanguage();
  const maximum = Math.max(...orderStatuses.map((status) => dashboard.ordersByStatus[status] ?? 0), 1);
  return (
    <div className="space-y-4 p-5">
      {orderStatuses.map((status) => {
        const total = dashboard.ordersByStatus[status] ?? 0;
        return (
          <div key={status}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">{t(statusKeys[status])}</span>
              <strong className="text-text">{total}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className={`h-full rounded-full ${statusColors[status]}`}
                style={{ width: `${(total / maximum) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyPanel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center p-5 text-center text-text-tertiary">
      {icon}
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

function DashboardLoading({ label }: { label: string }) {
  return (
    <div className="mt-7 flex min-h-80 items-center justify-center gap-2 rounded-xl border border-border bg-bg text-text-secondary shadow-sm">
      <LoaderCircle className="animate-spin text-primary" size={22} /> {label}
    </div>
  );
}

function statusBadgeClass(status: OrderStatus) {
  if (status === "DELIVERED") return "bg-emerald-700 text-white shadow-sm";
  if (status === "CANCELLED") return "bg-rose-700 text-white shadow-sm";
  if (status === "SHIPPED") return "bg-sky-700 text-white shadow-sm";
  if (status === "PROCESSING") return "bg-violet-700 text-white shadow-sm";
  if (status === "CONFIRMED") return "bg-indigo-700 text-white shadow-sm";
  return "bg-amber-400 text-amber-950 shadow-sm";
}
