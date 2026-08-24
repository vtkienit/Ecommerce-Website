import { useMemo, useState } from "react";
import { LoaderCircle, PackagePlus, Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { createProduct, deleteProduct, updateProduct } from "../api/catalogAdminApi";
import type { AdminProduct } from "../model/catalogAdminTypes";
import type { Category } from "../model/catalogTypes";
import ImageManager from "./ImageManager";
import VariantManager from "./VariantManager";
import { dangerButtonClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "./adminCatalogStyles";

type Props = {
  categories: Category[];
  products: AdminProduct[];
  onChange: (products: AdminProduct[]) => void;
  onMessage: (message: string, error?: boolean) => void;
};

type ProductDraft = {
  categoryId: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
};

const emptyDraft = (categoryId?: number): ProductDraft => ({
  categoryId: categoryId ? String(categoryId) : "",
  name: "",
  slug: "",
  brand: "",
  description: "",
});

export default function ProductManager({ categories, products, onChange, onMessage }: Props) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft(categories[0]?.id));
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedProduct = products.find((product) => product.id === selectedId) ?? null;
  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.brand, product.categoryName]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [products, search]);

  const select = (product: AdminProduct) => {
    setSelectedId(product.id);
    setCreating(false);
    setDraft({
      categoryId: String(product.categoryId),
      name: product.name,
      slug: product.slug,
      brand: product.brand ?? "",
      description: product.description ?? "",
    });
  };

  const startCreating = () => {
    setSelectedId(null);
    setCreating(true);
    setDraft(emptyDraft(categories[0]?.id));
  };

  const closeEditor = () => {
    setSelectedId(null);
    setCreating(false);
    setDraft(emptyDraft(categories[0]?.id));
  };

  const replaceProduct = (product: AdminProduct) => {
    onChange(products.map((item) => item.id === product.id ? product : item));
  };

  const save = async () => {
    const categoryId = Number(draft.categoryId);
    if (!draft.name.trim() || !Number.isInteger(categoryId) || categoryId <= 0) {
      onMessage(t("productRequiredFields"), true);
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...draft, categoryId };
      const saved = selectedProduct
        ? await updateProduct(selectedProduct.id, payload)
        : await createProduct(payload);
      onChange(selectedProduct
        ? products.map((product) => product.id === saved.id ? saved : product)
        : [saved, ...products]);
      setSelectedId(saved.id);
      setCreating(false);
      setDraft({
        categoryId: String(saved.categoryId),
        name: saved.name,
        slug: saved.slug,
        brand: saved.brand ?? "",
        description: saved.description ?? "",
      });
      onMessage(selectedProduct ? t("productUpdated") : t("productCreated"));
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedProduct || !window.confirm(t("deleteProductConfirm"))) return;

    setIsDeleting(true);
    try {
      await deleteProduct(selectedProduct.id);
      onChange(products.filter((product) => product.id !== selectedProduct.id));
      onMessage(t("productDeleted"));
      closeEditor();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="self-start overflow-hidden rounded-xl border border-border bg-bg shadow-sm xl:sticky xl:top-28">
        <div className="border-b border-border p-4">
          <button type="button" className={`${primaryButtonClass} w-full`} disabled={categories.length === 0} onClick={startCreating}>
            <PackagePlus size={18} /> {t("addProduct")}
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-border px-3">
            <Search size={17} className="text-text-tertiary" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchProducts")}
            />
          </div>
        </div>
        <div className="max-h-[65vh] divide-y divide-border overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => select(product)}
              className={`flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${selectedId === product.id ? "bg-primary/10" : "hover:bg-bg-secondary"}`}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-secondary">
                {product.images[0] && <img src={product.images[0].imageUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{product.name}</p>
                <p className="truncate text-xs text-text-tertiary">{product.categoryName} · {product.variants.length} SKU</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {!creating && !selectedProduct ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg p-8 text-center">
          <Pencil size={34} className="text-text-tertiary" />
          <p className="mt-3 font-semibold text-text">{t("selectProductToEdit")}</p>
          <p className="mt-1 text-sm text-text-secondary">{t("selectProductHint")}</p>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-bg p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-text">{selectedProduct ? t("editProduct") : t("addProduct")}</h2>
                <p className="mt-1 text-sm text-text-secondary">{t("productFormDescription")}</p>
              </div>
              <button type="button" className={secondaryButtonClass} onClick={closeEditor} aria-label={t("close")}>
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-text">
                {t("categoryName")}
                <select className={`${fieldClass} mt-1.5`} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                  <option value="">{t("selectCategory")}</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-text">
                {t("productName")}
                <input className={`${fieldClass} mt-1.5`} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              </label>
              <label className="block text-sm font-medium text-text">
                Slug
                <input className={`${fieldClass} mt-1.5`} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder={t("slugAutoHint")} />
              </label>
              <label className="block text-sm font-medium text-text">
                {t("brand")}
                <input className={`${fieldClass} mt-1.5`} value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} />
              </label>
              <label className="block text-sm font-medium text-text md:col-span-2">
                {t("description")}
                <textarea
                  className="mt-1.5 min-h-28 w-full resize-y rounded-md border border-border bg-bg p-3 text-sm text-text outline-none focus:border-primary"
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className={primaryButtonClass} disabled={isSaving} onClick={() => void save()}>
                {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
                {selectedProduct ? t("saveChanges") : t("createProduct")}
              </button>
              {selectedProduct && (
                <button type="button" className={dangerButtonClass} disabled={isDeleting} onClick={() => void remove()}>
                  {isDeleting ? <LoaderCircle className="animate-spin" size={17} /> : <Trash2 size={17} />}
                  {t("deleteProduct")}
                </button>
              )}
            </div>
          </section>

          {selectedProduct && (
            <>
              <VariantManager product={selectedProduct} onChange={replaceProduct} onMessage={onMessage} />
              <ImageManager product={selectedProduct} onChange={replaceProduct} onMessage={onMessage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
