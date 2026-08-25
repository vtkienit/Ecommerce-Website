import { useEffect, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { CalendarClock, LoaderCircle, Pencil, Plus, Save, Search, TicketPercent, Trash2, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import AdminPagination from "../../../shared/components/AdminPagination";
import useDebouncedValue from "../../../shared/hooks/useDebouncedValue";
import { createVoucher, deleteVoucher, getVouchers, updateVoucher } from "../api/commerceApi";
import type { DiscountType, Voucher, VoucherPayload } from "../model/commerceTypes";

type VoucherDraft = {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  quantity: string;
  startDate: string;
  endDate: string;
};

export default function VoucherAdminView() {
  const { lang, t } = useLanguage();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [draft, setDraft] = useState<VoucherDraft>(() => emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const currency = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  useEffect(() => {
    let active = true;
    getVouchers({ page, size: 6, search: debouncedSearch })
      .then((data) => {
        if (!active) return;
        setVouchers(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("voucherAdminError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedSearch, page, reloadKey, t]);

  const change = (field: keyof VoucherDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setError("");
  };

  const edit = (voucher: Voucher) => {
    setEditingId(voucher.id);
    setDraft({
      code: voucher.code,
      description: voucher.description ?? "",
      discountType: voucher.discountType,
      discountValue: String(voucher.discountValue),
      minOrderAmount: String(voucher.minOrderAmount),
      maxDiscountAmount: voucher.maxDiscountAmount === null ? "" : String(voucher.maxDiscountAmount),
      quantity: String(voucher.quantity),
      startDate: voucher.startDate.slice(0, 16),
      endDate: voucher.endDate.slice(0, 16),
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(draft);
    if (!payload) {
      setError(t("voucherFormInvalid"));
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = editingId
        ? await updateVoucher(editingId, payload)
        : await createVoucher(payload);
      setVouchers((current) => editingId
        ? current.map((voucher) => voucher.id === saved.id ? saved : voucher)
        : [saved, ...current]);
      setSuccess(editingId ? t("voucherUpdated") : t("voucherCreated"));
      if (!editingId) setPage(0);
      setReloadKey((current) => current + 1);
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("voucherAdminError"));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (voucher: Voucher) => {
    if (!window.confirm(t("deleteVoucherConfirm").replace("{code}", voucher.code))) return;
    setDeletingId(voucher.id);
    setError("");
    setSuccess("");
    try {
      await deleteVoucher(voucher.id);
      setVouchers((current) => current.filter((entry) => entry.id !== voucher.id));
      if (vouchers.length === 1 && page > 0) setPage((current) => current - 1);
      else setReloadKey((current) => current + 1);
      if (editingId === voucher.id) reset();
      setSuccess(t("voucherDeleted"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("voucherAdminError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>{t("voucherManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("voucherManagement")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("voucherManagementDescription")}</p>
          </header>

          {error && <p className="mt-5 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          {success && <p className="mt-5 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}

          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[410px_minmax(0,1fr)]">
            <form onSubmit={submit} className="rounded-xl border border-border bg-bg p-5 shadow-sm xl:sticky xl:top-28">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-text">{editingId ? t("editVoucher") : t("createVoucher")}</h2>
                {editingId && (
                  <button type="button" onClick={reset} className="rounded-md p-2 text-text-tertiary hover:bg-bg-secondary">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <AdminField label={t("voucherCode")} value={draft.code} onChange={(value) => change("code", value.toUpperCase())} required />
                <label className="text-sm font-medium text-text-secondary">
                  {t("discountType")}
                  <select value={draft.discountType} onChange={(event) => change("discountType", event.target.value)} className={inputClass}>
                    <option value="PERCENTAGE">{t("percentageDiscount")}</option>
                    <option value="FIXED_AMOUNT">{t("fixedDiscount")}</option>
                  </select>
                </label>
                <AdminField label={t("discountValue")} type="number" min="0.01" value={draft.discountValue} onChange={(value) => change("discountValue", value)} required />
                <AdminField label={t("voucherQuantity")} type="number" min="1" step="1" value={draft.quantity} onChange={(value) => change("quantity", value)} required />
                <AdminField label={t("minimumOrder")} type="number" min="0" value={draft.minOrderAmount} onChange={(value) => change("minOrderAmount", value)} required />
                <AdminField label={t("maximumDiscount")} type="number" min="0" value={draft.maxDiscountAmount} onChange={(value) => change("maxDiscountAmount", value)} />
                <AdminField label={t("startDate")} type="datetime-local" value={draft.startDate} onChange={(value) => change("startDate", value)} required />
                <AdminField label={t("endDate")} type="datetime-local" value={draft.endDate} onChange={(value) => change("endDate", value)} required />
              </div>
              <label className="mt-4 block text-sm font-medium text-text-secondary">
                {t("description")}
                <textarea value={draft.description} onChange={(event) => change("description", event.target.value)} className={`${inputClass} min-h-20 py-2.5`} />
              </label>
              <button type="submit" disabled={isSaving} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white transition-all hover:brightness-95 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? t("saveChanges") : t("createVoucher")}
              </button>
            </form>

            <section>
              <label className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-bg px-4 shadow-sm">
                <Search size={18} className="text-text-tertiary" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder={t("voucherCode")}
                  className="h-12 min-w-0 flex-1 bg-transparent text-text outline-none"
                />
                <span className="text-sm text-text-tertiary">{totalElements}</span>
              </label>
              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
                  <LoaderCircle className="animate-spin text-primary" size={21} /> {t("voucherLoading")}
                </div>
              ) : vouchers.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg text-center shadow-sm">
                  <TicketPercent size={38} className="text-text-tertiary" />
                  <p className="mt-3 text-text-secondary">{t("voucherEmpty")}</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {vouchers.map((voucher) => (
                    <article key={voucher.id} className="rounded-xl border border-border bg-bg p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-lg font-bold text-primary">{voucher.code}</span>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${voucher.active ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-bg-secondary text-text-tertiary"}`}>
                              {voucher.active ? t("voucherActive") : t("voucherInactive")}
                            </span>
                          </div>
                          {voucher.description && <p className="mt-1 text-sm text-text-secondary">{voucher.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => edit(voucher)} className="rounded-md p-2 text-text-secondary hover:bg-bg-secondary hover:text-primary"><Pencil size={17} /></button>
                          <button type="button" disabled={deletingId === voucher.id} onClick={() => void remove(voucher)} className="rounded-md p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                            {deletingId === voucher.id ? <LoaderCircle className="animate-spin" size={17} /> : <Trash2 size={17} />}
                          </button>
                        </div>
                      </div>
                      <p className="mt-4 text-2xl font-bold text-red-700">
                        {voucher.discountType === "PERCENTAGE" ? `${voucher.discountValue}%` : currency.format(voucher.discountValue)}
                      </p>
                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                        <VoucherInfo label={t("minimumOrder")} value={currency.format(voucher.minOrderAmount)} />
                        <VoucherInfo label={t("voucherUsage")} value={`${voucher.usedCount}/${voucher.quantity}`} />
                      </dl>
                      <div className="mt-4 flex gap-2 text-xs leading-5 text-text-tertiary">
                        <CalendarClock className="mt-0.5 shrink-0" size={15} />
                        <span>{dateTime.format(new Date(voucher.startDate))}<br />{dateTime.format(new Date(voucher.endDate))}</span>
                      </div>
                    </article>
                    ))}
                  </div>
                  <AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

const inputClass = "mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-text outline-none focus:border-primary";

function AdminField({ label, value, onChange, type = "text", required = false, min, step }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="text-sm font-medium text-text-secondary">
      {label}
      <input type={type} required={required} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function VoucherInfo({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text">{value}</dd></div>;
}

function emptyDraft(): VoucherDraft {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return {
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    quantity: "100",
    startDate: toLocalDateTime(start),
    endDate: toLocalDateTime(end),
  };
}

function toPayload(draft: VoucherDraft): VoucherPayload | null {
  const discountValue = Number(draft.discountValue);
  const minOrderAmount = Number(draft.minOrderAmount);
  const maxDiscountAmount = draft.maxDiscountAmount.trim() ? Number(draft.maxDiscountAmount) : null;
  const quantity = Number(draft.quantity);
  if (!draft.code.trim() || !draft.startDate || !draft.endDate
    || !Number.isFinite(discountValue) || discountValue <= 0
    || !Number.isFinite(minOrderAmount) || minOrderAmount < 0
    || (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0))
    || !Number.isInteger(quantity) || quantity < 1) return null;
  return {
    code: draft.code.trim(),
    description: draft.description.trim(),
    discountType: draft.discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    quantity,
    startDate: draft.startDate,
    endDate: draft.endDate,
  };
}

function toLocalDateTime(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
