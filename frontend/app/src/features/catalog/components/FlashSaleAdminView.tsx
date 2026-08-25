import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import {
  CalendarClock,
  Flame,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import AdminPagination from "../../../shared/components/AdminPagination";
import {
  createFlashSale,
  deleteFlashSale,
  getAdminProducts,
  getFlashSales,
  updateFlashSale,
} from "../api/catalogAdminApi";
import type {
  AdminFlashSale,
  AdminProduct,
  FlashSalePayload,
} from "../model/catalogAdminTypes";

type FlashSaleDraft = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: string;
  productIds: number[];
};

export default function FlashSaleAdminView() {
  const { lang, t } = useLanguage();
  const [flashSales, setFlashSales] = useState<AdminFlashSale[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [draft, setDraft] = useState<FlashSaleDraft>(() => emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dateTime = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      getFlashSales({ page, size: 6 }),
      getAdminProducts({ page: 0, size: 50 }),
    ])
      .then(([salesPage, productsPage]) => {
        if (!active) return;
        setFlashSales(salesPage.content);
        setTotalElements(salesPage.totalElements);
        setTotalPages(salesPage.totalPages);
        setProducts(productsPage.content);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("flashSaleAdminError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reloadKey, t]);

  const visibleProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) =>
      `${product.name} ${product.categoryName}`.toLowerCase().includes(keyword)
    );
  }, [productSearch, products]);

  const change = (field: Exclude<keyof FlashSaleDraft, "productIds">, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const toggleProduct = (productId: number) => {
    setDraft((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setProductSearch("");
    setError("");
  };

  const edit = (flashSale: AdminFlashSale) => {
    setEditingId(flashSale.id);
    setDraft({
      name: flashSale.name,
      description: flashSale.description ?? "",
      startDate: flashSale.startDate.slice(0, 16),
      endDate: flashSale.endDate.slice(0, 16),
      discountPercentage: String(flashSale.discountPercentage),
      productIds: flashSale.productIds,
    });
    setProductSearch("");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(draft);
    if (!payload) {
      setError(t("flashSaleFormInvalid"));
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await (editingId
        ? updateFlashSale(editingId, payload)
        : createFlashSale(payload));
      setSuccess(editingId ? t("flashSaleUpdated") : t("flashSaleCreated"));
      setEditingId(null);
      setDraft(emptyDraft());
      setProductSearch("");
      setPage(0);
      setIsLoading(true);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("flashSaleAdminError"));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (flashSale: AdminFlashSale) => {
    if (!window.confirm(t("deleteFlashSaleConfirm").replace("{name}", flashSale.name))) return;
    setDeletingId(flashSale.id);
    setError("");
    setSuccess("");
    try {
      await deleteFlashSale(flashSale.id);
      if (editingId === flashSale.id) reset();
      if (flashSales.length === 1 && page > 0) setPage((current) => current - 1);
      else {
        setIsLoading(true);
        setReloadKey((current) => current + 1);
      }
      setSuccess(t("flashSaleDeleted"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("flashSaleAdminError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>{t("flashSaleManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
            <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("flashSaleManagement")}</h1>
            <p className="mt-2 text-sm text-text-secondary">{t("flashSaleManagementDescription")}</p>
          </header>

          {error && <p className="mt-5 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          {success && <p className="mt-5 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}

          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
            <form noValidate onSubmit={submit} className="rounded-xl border border-border bg-bg p-5 shadow-sm xl:sticky xl:top-28">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-text">
                  {editingId ? t("editFlashSale") : t("createFlashSale")}
                </h2>
                {editingId && (
                  <button type="button" onClick={reset} className="rounded-md p-2 text-text-tertiary hover:bg-bg-secondary">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <AdminField label={t("flashSaleName")} value={draft.name} onChange={(value) => change("name", value)} className="sm:col-span-2" />
                <AdminField label={t("startDate")} type="datetime-local" value={draft.startDate} onChange={(value) => change("startDate", value)} />
                <AdminField label={t("endDate")} type="datetime-local" value={draft.endDate} onChange={(value) => change("endDate", value)} />
                <AdminField
                  label={t("discountPercentage")}
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  value={draft.discountPercentage}
                  onChange={(value) => change("discountPercentage", value)}
                  className="sm:col-span-2"
                />
              </div>

              <label className="mt-4 block text-sm font-medium text-text-secondary">
                {t("description")}
                <textarea
                  value={draft.description}
                  maxLength={255}
                  placeholder={t("description")}
                  onChange={(event) => change("description", event.target.value)}
                  className={`${inputClass} min-h-20 py-2.5`}
                />
              </label>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-text">{t("saleProducts")}</label>
                  <span className="text-xs font-semibold text-primary">
                    {t("productsSelected").replace("{count}", String(draft.productIds.length))}
                  </span>
                </div>
                <label className="mt-2 flex items-center gap-2 rounded-md border border-border bg-bg px-3">
                  <Search size={16} className="text-text-tertiary" />
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder={t("searchProducts")}
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
                  />
                </label>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {visibleProducts.map((product) => {
                    const selected = draft.productIds.includes(product.id);
                    const image = product.images.find((item) => item.primary) ?? product.images[0];
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${selected ? "border-primary bg-primary/8" : "border-border bg-bg hover:border-primary/40"}`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-bg-secondary text-text-tertiary">
                          {image ? <img src={image.imageUrl} alt="" className="h-full w-full object-cover" /> : <Package size={18} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-text">{product.name}</strong>
                          <small className="text-text-tertiary">{product.categoryName}</small>
                        </span>
                        <input type="checkbox" checked={selected} readOnly className="pointer-events-none h-4 w-4 accent-primary" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white transition-all hover:brightness-95 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : editingId ? <Pencil size={18} /> : <Plus size={18} />}
                {editingId ? t("saveChanges") : t("createFlashSale")}
              </button>
            </form>

            <section>
              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
                  <LoaderCircle className="animate-spin text-primary" size={21} /> {t("flashSaleLoading")}
                </div>
              ) : flashSales.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg text-center shadow-sm">
                  <Flame size={40} className="text-text-tertiary" />
                  <p className="mt-3 text-text-secondary">{t("flashSaleEmpty")}</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {flashSales.map((flashSale) => {
                      const status = getFlashSaleStatus(flashSale);
                      return (
                        <article key={flashSale.id} className="rounded-xl border border-border bg-bg p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate font-semibold text-text">{flashSale.name}</h2>
                                <StatusBadge status={status} />
                              </div>
                              {flashSale.description && <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{flashSale.description}</p>}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button type="button" onClick={() => edit(flashSale)} className="rounded-md p-2 text-text-secondary hover:bg-bg-secondary hover:text-primary"><Pencil size={17} /></button>
                              <button type="button" disabled={deletingId === flashSale.id} onClick={() => void remove(flashSale)} className="rounded-md p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                                {deletingId === flashSale.id ? <LoaderCircle className="animate-spin" size={17} /> : <Trash2 size={17} />}
                              </button>
                            </div>
                          </div>
                          <p className="mt-5 text-3xl font-bold text-red-600">-{flashSale.discountPercentage}%</p>
                          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                            <Info label={t("productsLabel")} value={String(flashSale.productCount)} />
                            <Info label={t("productVariants")} value={String(flashSale.variantCount)} />
                          </dl>
                          <div className="mt-4 flex gap-2 text-xs leading-5 text-text-tertiary">
                            <CalendarClock className="mt-0.5 shrink-0" size={15} />
                            <span>{dateTime.format(new Date(flashSale.startDate))}<br />{dateTime.format(new Date(flashSale.endDate))}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <AdminPagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onChange={(nextPage) => {
                      setIsLoading(true);
                      setPage(nextPage);
                    }}
                  />
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

function AdminField({ label, value, onChange, type = "text", min, max, step, className = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm font-medium text-text-secondary ${className}`}>
      {label}
      <input type={type} required min={min} max={max} step={step} value={value} placeholder={label} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function StatusBadge({ status }: { status: "active" | "upcoming" | "expired" }) {
  const { t } = useLanguage();
  const classes = status === "active"
    ? "bg-green-500/10 text-green-700 dark:text-green-300"
    : status === "upcoming"
      ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
      : "bg-bg-secondary text-text-tertiary";
  const label = status === "active" ? t("flashSaleActive") : status === "upcoming" ? t("flashSaleUpcoming") : t("flashSaleExpired");
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text">{value}</dd></div>;
}

function getFlashSaleStatus(flashSale: AdminFlashSale) {
  const now = Date.now();
  if (now < new Date(flashSale.startDate).getTime()) return "upcoming" as const;
  if (now >= new Date(flashSale.endDate).getTime()) return "expired" as const;
  return "active" as const;
}

function emptyDraft(): FlashSaleDraft {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  return {
    name: "",
    description: "",
    startDate: toLocalDateTime(startDate),
    endDate: toLocalDateTime(endDate),
    discountPercentage: "20",
    productIds: [],
  };
}

function toPayload(draft: FlashSaleDraft): FlashSalePayload | null {
  const discountPercentage = Number(draft.discountPercentage);
  const startDate = new Date(draft.startDate);
  const endDate = new Date(draft.endDate);
  if (!draft.name.trim() || draft.productIds.length === 0
    || !Number.isFinite(discountPercentage) || discountPercentage < 1 || discountPercentage > 90
    || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    return null;
  }
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    startDate: draft.startDate,
    endDate: draft.endDate,
    discountPercentage,
    productIds: draft.productIds,
  };
}

function toLocalDateTime(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
