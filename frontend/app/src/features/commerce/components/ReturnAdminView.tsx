import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LoaderCircle, PackageOpen, RotateCcw, Search } from "lucide-react";
import { useLanguage, type TranslationKey } from "../../../app/contexts/LanguageContext";
import AdminFeedbackBanner from "../../../shared/components/AdminFeedbackBanner";
import AdminPagination from "../../../shared/components/AdminPagination";
import useDebouncedValue from "../../../shared/hooks/useDebouncedValue";
import { getAdminReturnRequests, updateReturnRequestStatus } from "../api/commerceApi";
import type { ReturnRequest, ReturnRequestStatus } from "../model/commerceTypes";

type StatusFilter = "ALL" | ReturnRequestStatus;

const statuses: StatusFilter[] = ["ALL", "REQUESTED", "APPROVED", "REJECTED", "COMPLETED"];

const statusKeys: Record<ReturnRequestStatus, TranslationKey> = {
  REQUESTED: "returnStatusRequested",
  APPROVED: "returnStatusApproved",
  REJECTED: "returnStatusRejected",
  COMPLETED: "returnStatusCompleted",
};

export default function ReturnAdminView() {
  const { lang, t } = useLanguage();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    let active = true;
    getAdminReturnRequests({
      status: filter === "ALL" ? undefined : filter,
      search: debouncedSearch,
      page,
      size: 6,
    })
      .then((data) => {
        if (!active) return;
        setRequests(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("returnAdminError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, filter, page, reloadKey, t]);

  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const changeStatus = async (request: ReturnRequest, status: ReturnRequestStatus) => {
    const note = notes[request.id]?.trim();
    if (status === "REJECTED" && !note) {
      setError(t("returnRejectionNoteRequired"));
      return;
    }
    if (status === "COMPLETED" && !window.confirm(t("completeReturnConfirm"))) return;

    setUpdatingId(request.id);
    setError("");
    setSuccess("");
    try {
      const updated = await updateReturnRequestStatus(request.id, status, note);
      setRequests((current) => filter === "ALL"
        ? current.map((item) => item.id === request.id ? updated : item)
        : current.filter((item) => item.id !== request.id));
      setReloadKey((current) => current + 1);
      setNotes((current) => ({ ...current, [request.id]: "" }));
      setSuccess(t("returnStatusUpdated"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("returnAdminError"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Helmet><title>{t("returnManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("returnManagement")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("returnManagementDescription")}</p>
          </header>

          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex items-center gap-3 rounded-lg border border-border bg-bg px-4 shadow-sm">
              <Search size={19} className="text-text-tertiary" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder={t("searchReturnRequests")}
                className="h-12 min-w-0 flex-1 bg-transparent text-text outline-none"
              />
              <span className="text-sm text-text-tertiary">{totalElements}</span>
            </label>
            <select
              value={filter}
              onChange={(event) => {
                setIsLoading(true);
                setError("");
                setPage(0);
                setFilter(event.target.value as StatusFilter);
              }}
              aria-label={t("filterReturnStatus")}
              className="h-12 rounded-lg border border-border bg-bg px-4 font-medium text-text outline-none focus:border-primary"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? t("allReturnRequests") : t(statusKeys[status])}
                </option>
              ))}
            </select>
          </div>

          {error && <AdminFeedbackBanner type="error" message={error} />}
          {success && <AdminFeedbackBanner type="success" message={success} />}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={21} /> {t("returnAdminLoading")}
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg text-center">
              <PackageOpen size={38} className="text-text-tertiary" />
              <p className="mt-3 text-text-secondary">{t("returnAdminEmpty")}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {requests.map((request) => (
                <article key={request.id} className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-bg-secondary px-4 py-4 sm:px-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <RotateCcw size={18} className="text-primary" />
                        <h2 className="font-bold text-text">#{request.orderNumber}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${returnStatusClass(request.status)}`}>
                          {t(statusKeys[request.status])}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {t("returnRequestedAt")}: {dateTime.format(new Date(request.requestedAt))}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">{currency.format(request.totalAmount)}</p>
                  </header>

                  <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(320px,1.2fr)]">
                    <section>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                        {t("returnReason")}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{request.reason}</p>
                      <p className="mt-3 text-xs text-text-tertiary">{t("customerId")}: {request.userId}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {request.paymentMethod === "PAYOS" ? t("onlinePayment") : t("cashOnDelivery")} · {paymentLabel(request.paymentStatus, t)}
                      </p>
                      {request.adminNote && (
                        <p className="mt-3 rounded-md bg-bg-secondary p-3 text-sm text-text-secondary">
                          <span className="font-semibold text-text">{t("adminResponse")}:</span> {request.adminNote}
                        </p>
                      )}
                    </section>

                    <section className="divide-y divide-border rounded-lg border border-border">
                      {request.items.map((item) => (
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

                  {(request.status === "REQUESTED" || request.status === "APPROVED") && (
                    <footer className="border-t border-border px-4 py-4 sm:px-5">
                      {request.status === "APPROVED" && (
                        <p className="mb-3 rounded-md bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">
                          {t("manualRefundNotice")}
                        </p>
                      )}
                      <textarea
                        value={notes[request.id] ?? ""}
                        onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                        rows={2}
                        maxLength={1000}
                        placeholder={t("returnAdminNotePlaceholder")}
                        className="w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                      />
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {request.status === "REQUESTED" ? (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === request.id}
                              onClick={() => void changeStatus(request, "REJECTED")}
                              className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {t("rejectReturn")}
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === request.id}
                              onClick={() => void changeStatus(request, "APPROVED")}
                              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-95 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingId === request.id && <LoaderCircle className="animate-spin" size={16} />}
                              {t("approveReturn")}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingId === request.id}
                            onClick={() => void changeStatus(request, "COMPLETED")}
                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-95 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingId === request.id && <LoaderCircle className="animate-spin" size={16} />}
                            {t("completeReturn")}
                          </button>
                        )}
                      </div>
                    </footer>
                  )}
                </article>
              ))}
              <AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function returnStatusClass(status: ReturnRequestStatus) {
  if (status === "COMPLETED") return "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "REJECTED") return "border border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200";
  if (status === "APPROVED") return "border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
  return "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
}

function paymentLabel(
  status: ReturnRequest["paymentStatus"],
  t: (key: TranslationKey) => string,
) {
  if (status === "PAID") return t("paymentPaid");
  if (status === "REFUNDED") return t("paymentRefunded");
  if (status === "CANCELLED") return t("paymentCancelled");
  if (status === "FAILED") return t("paymentFailed");
  return t("paymentPending");
}
