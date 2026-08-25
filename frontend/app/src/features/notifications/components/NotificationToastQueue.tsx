import { BellRing, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import type { ToastNotification } from "../model/notificationTypes";

type NotificationToastQueueProps = {
  notification: ToastNotification | undefined;
  waitingCount: number;
  onDismiss: () => void;
};

export default function NotificationToastQueue({
  notification,
  waitingCount,
  onDismiss,
}: NotificationToastQueueProps) {
  const { t } = useLanguage();

  if (!notification) return null;

  const isNewOrder = notification.type === "NEW_ORDER";
  const title = isNewOrder
    ? t("newOrderNotificationTitle")
    : t("orderConfirmedNotificationTitle");
  const message = isNewOrder
    ? `${t("newOrderFrom")} ${notification.recipientName} · #${notification.orderNumber}`
    : `${t("orderConfirmedNotificationBody")} · #${notification.orderNumber}`;

  return (
    <aside
      className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-xl border border-primary/20 bg-bg shadow-2xl sm:right-6 sm:top-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BellRing size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text">{title}</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">{message}</p>
          {waitingCount > 0 && (
            <p className="mt-2 text-xs font-medium text-primary">
              +{waitingCount} {t("notificationsWaiting")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-tertiary hover:bg-bg-secondary hover:text-text"
          aria-label={t("close")}
        >
          <X size={17} />
        </button>
      </div>
      <div className="h-1 animate-pulse bg-primary" />
    </aside>
  );
}
