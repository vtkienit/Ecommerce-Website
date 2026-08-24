import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Clock3, LoaderCircle, RefreshCw, XCircle } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import MainLayout from "../../../shared/layouts/MainLayout";
import { getStoredUser } from "../../auth/model/authSession";
import { cancelOrder, syncOrderPayment } from "../api/commerceApi";
import type { Order } from "../model/commerceTypes";

export type PaymentResultMode = "success" | "cancel";

export default function PaymentResultView({ mode }: { mode: PaymentResultMode }) {
  const { t } = useLanguage();
  const user = getStoredUser();
  const isAuthenticated = user !== null;
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get("orderCode"));
  const validOrderId = Number.isSafeInteger(orderId) && orderId > 0;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(validOrderId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !validOrderId) return;

    let active = true;
    const request = mode === "success" ? syncOrderPayment(orderId) : cancelOrder(orderId);
    request
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("paymentResultError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, mode, orderId, t, validOrderId]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const retry = async () => {
    setIsLoading(true);
    setError("");
    try {
      setOrder(await syncOrderPayment(orderId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("paymentResultError"));
    } finally {
      setIsLoading(false);
    }
  };

  const paid = order?.paymentStatus === "PAID";
  const cancelled = mode === "cancel" && order?.status === "CANCELLED";
  const title = cancelled
    ? t("paymentCancelledTitle")
    : paid
      ? t("paymentSuccessTitle")
      : t("paymentPendingTitle");
  const subtitle = cancelled
    ? t("paymentCancelledSubtitle")
    : paid
      ? t("paymentSuccessSubtitle")
      : t("paymentPendingSubtitle");

  return (
    <MainLayout>
      <Helmet><title>{title} | QuyDung</title></Helmet>
      <main className="flex min-h-[65vh] items-center justify-center bg-bg-subtle px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-border bg-bg p-7 text-center shadow-sm sm:p-10">
          {isLoading ? (
            <>
              <LoaderCircle className="mx-auto animate-spin text-primary" size={48} />
              <h1 className="mt-5 text-2xl font-semibold text-text">{t("checkingPayment")}</h1>
            </>
          ) : !validOrderId || error ? (
            <>
              <XCircle className="mx-auto text-red-500" size={52} />
              <h1 className="mt-5 text-2xl font-semibold text-text">{t("paymentResultErrorTitle")}</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {!validOrderId ? t("invalidPaymentOrder") : error}
              </p>
            </>
          ) : (
            <>
              {cancelled ? (
                <XCircle className="mx-auto text-amber-500" size={52} />
              ) : paid ? (
                <CheckCircle2 className="mx-auto text-green-500" size={52} />
              ) : (
                <Clock3 className="mx-auto text-primary" size={52} />
              )}
              <h1 className="mt-5 text-2xl font-semibold text-text">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{subtitle}</p>
              {order && (
                <p className="mt-4 rounded-lg bg-bg-secondary px-4 py-3 text-sm font-semibold text-text">
                  {t("orderNumber")}: {order.orderNumber}
                </p>
              )}
            </>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!isLoading && validOrderId && !paid && !cancelled && (
              <button
                type="button"
                onClick={() => void retry()}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary"
              >
                <RefreshCw size={17} /> {t("checkPaymentAgain")}
              </button>
            )}
            <Link to="/purchases" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              {t("viewPurchases")}
            </Link>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
