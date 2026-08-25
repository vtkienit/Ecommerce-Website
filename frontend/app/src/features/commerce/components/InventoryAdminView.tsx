import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LoaderCircle, PackageSearch, Save, Search } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import AdminPagination from "../../../shared/components/AdminPagination";
import useDebouncedValue from "../../../shared/hooks/useDebouncedValue";
import { getInventory, updateInventory } from "../api/commerceApi";
import type { InventoryItem } from "../model/commerceTypes";

export default function InventoryAdminView() {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    let active = true;
    getInventory({ page, size: 10, search: debouncedSearch })
      .then((data) => {
        if (!active) return;
        setInventory(data.content);
        setDrafts(toDrafts(data.content));
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : t("inventoryLoadError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, page, t]);

  const save = async (item: InventoryItem) => {
    const quantity = Number(drafts[item.variantId]);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError(t("inventoryInvalid"));
      return;
    }

    setSavingId(item.variantId);
    setError("");
    setSuccess("");
    try {
      const updated = await updateInventory(item.variantId, quantity);
      setInventory((current) => current.map((entry) => entry.variantId === updated.variantId ? updated : entry));
      setDrafts((current) => ({ ...current, [updated.variantId]: String(updated.onHandQuantity) }));
      setSuccess(t("inventoryUpdated"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("inventoryLoadError"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Helmet><title>{t("inventoryManagement")} | QuyDung</title></Helmet>
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="mx-auto max-w-7xl">
          <header>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
              <h1 className="mt-1 text-3xl font-semibold text-text md:text-4xl">{t("inventoryManagement")}</h1>
              <p className="mt-2 text-sm text-text-secondary">{t("inventoryDescription")}</p>
            </div>
          </header>

          <div className="mt-7 flex items-center gap-3 rounded-lg border border-border bg-bg px-4 shadow-sm">
            <Search size={19} className="text-text-tertiary" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder={t("searchInventory")}
              className="h-12 min-w-0 flex-1 bg-transparent text-text outline-none"
            />
            <span className="text-sm text-text-tertiary">{totalElements}</span>
          </div>

          {error && <p className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
          {success && <p className="mt-4 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">{success}</p>}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-text-secondary">
              <LoaderCircle className="animate-spin text-primary" size={21} /> {t("inventoryLoading")}
            </div>
          ) : inventory.length === 0 ? (
            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-xl border border-border bg-bg text-center">
              <PackageSearch size={36} className="text-text-tertiary" />
              <p className="mt-3 text-text-secondary">{t("inventoryEmpty")}</p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
              <div className="hidden grid-cols-[minmax(180px,1fr)_90px_80px_90px_130px] gap-3 border-b border-border bg-bg-secondary px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary md:grid">
                <span>{t("productDesc")}</span>
                <span>{t("stockOnHand")}</span>
                <span>{t("stockReserved")}</span>
                <span>{t("stockAvailable")}</span>
                <span />
              </div>
              <div className="divide-y divide-border">
                {inventory.map((item) => (
                  <article key={item.variantId} className="grid gap-4 p-4 md:grid-cols-[minmax(180px,1fr)_90px_80px_90px_130px] md:items-center md:gap-3 md:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-bg-secondary">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-text">{item.productName}</p>
                        <p className="truncate text-xs text-text-tertiary">{item.sku}</p>
                        <p className="mt-1 text-xs text-text-secondary">{[item.size, item.thickness, item.color].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                    <label className="flex items-center justify-between gap-3 text-sm text-text-secondary md:block">
                      <span className="md:hidden">{t("stockOnHand")}</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={drafts[item.variantId] ?? "0"}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [item.variantId]: event.target.value,
                        }))}
                        className="h-10 w-28 rounded-md border border-border bg-bg px-3 text-right font-semibold text-text outline-none focus:border-primary md:w-full md:text-left"
                      />
                    </label>
                    <StockValue label={t("stockReserved")} value={item.reservedQuantity} />
                    <StockValue label={t("stockAvailable")} value={item.availableQuantity} highlight={item.availableQuantity <= 5} />
                    <button
                      type="button"
                      disabled={savingId === item.variantId}
                      onClick={() => void save(item)}
                      className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId === item.variantId ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
                      {t("saveChanges")}
                    </button>
                  </article>
                ))}
              </div>
              <div className="px-4 pb-4 sm:px-5">
                <AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StockValue({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm md:block">
      <span className="text-text-secondary md:hidden">{label}</span>
      <span className={highlight ? "font-bold text-red-600" : "font-semibold text-text"}>{value}</span>
    </div>
  );
}

function toDrafts(inventory: InventoryItem[]) {
  return Object.fromEntries(inventory.map((item) => [item.variantId, String(item.onHandQuantity)]));
}
