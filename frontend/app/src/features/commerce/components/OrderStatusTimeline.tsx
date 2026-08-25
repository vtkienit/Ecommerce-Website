import { Check, X } from "lucide-react";
import { useLanguage, type TranslationKey } from "../../../app/contexts/LanguageContext";
import type { OrderStatus, OrderStatusHistory } from "../model/commerceTypes";

const statusKeys: Record<OrderStatus, TranslationKey> = {
  PENDING: "orderStatusPending",
  CONFIRMED: "orderStatusConfirmed",
  PROCESSING: "orderStatusProcessing",
  SHIPPED: "orderStatusShipped",
  DELIVERED: "orderStatusDelivered",
  CANCELLED: "orderStatusCancelled",
};

export default function OrderStatusTimeline({ history }: { history: OrderStatusHistory[] }) {
  const { lang, t } = useLanguage();
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });

  if (history.length === 0) return null;

  return (
    <section className="border-t border-border px-4 py-4 sm:px-5">
      <p className="mb-3 text-sm font-semibold text-text">{t("orderTimeline")}</p>
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-max sm:min-w-0" aria-label={t("orderTimeline")}>
          {history.map((event, index) => {
            const cancelled = event.status === "CANCELLED";
            return (
              <li key={`${event.status}-${event.changedAt}`} className="w-40 sm:w-auto sm:min-w-0 sm:flex-1">
                <div className="flex items-center">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${cancelled ? "bg-red-500" : "bg-primary"}`}>
                    {cancelled ? <X size={15} /> : <Check size={15} />}
                  </span>
                  {index < history.length - 1 && (
                    <span className={`h-0.5 flex-1 ${history[index + 1].status === "CANCELLED" ? "bg-red-200 dark:bg-red-900" : "bg-primary/25"}`} />
                  )}
                </div>
                <p className={`mt-2 pr-3 text-sm font-semibold ${cancelled ? "text-red-600 dark:text-red-400" : "text-text"}`}>
                  {t(statusKeys[event.status])}
                </p>
                <time className="mt-0.5 block pr-3 text-xs text-text-tertiary" dateTime={event.changedAt}>
                  {dateTime.format(new Date(event.changedAt))}
                </time>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
