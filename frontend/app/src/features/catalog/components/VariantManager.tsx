import { useState } from "react";
import { LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { useConfirmDialog } from "../../../app/contexts/ConfirmDialogContext";
import { createVariant, deleteVariant, updateVariant } from "../api/catalogAdminApi";
import type { AdminProduct, AdminVariant } from "../model/catalogAdminTypes";
import { dangerButtonClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "./adminCatalogStyles";

type Props = {
  product: AdminProduct;
  onChange: (product: AdminProduct) => void;
  onMessage: (message: string, error?: boolean) => void;
};

const emptyDraft = { sku: "", size: "", thickness: "", color: "", price: "" };

export default function VariantManager({ product, onChange, onMessage }: Props) {
  const { lang, t } = useLanguage();
  const requestConfirmation = useConfirmDialog();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reset = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const edit = (variant: AdminVariant) => {
    setEditingId(variant.id);
    setDraft({
      sku: variant.sku,
      size: variant.size ?? "",
      thickness: variant.thickness ?? "",
      color: variant.color ?? "",
      price: String(variant.price),
    });
  };

  const save = async () => {
    const price = Number(draft.price);
    if (!draft.sku.trim() || !Number.isFinite(price) || price < 50_000 || price > 500_000) {
      onMessage(t("variantInvalid"), true);
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...draft, price };
      const saved = editingId
        ? await updateVariant(editingId, payload)
        : await createVariant(product.id, payload);
      onChange(saved);
      onMessage(editingId ? t("variantUpdated") : t("variantCreated"));
      reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (variant: AdminVariant) => {
    if (!await requestConfirmation({
      message: t("deleteVariantConfirm"),
      confirmLabel: t("delete"),
      tone: "danger",
    })) return;

    setDeletingId(variant.id);
    try {
      onChange(await deleteVariant(variant.id));
      onMessage(t("variantDeleted"));
      if (editingId === variant.id) reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-text">{t("productVariants")}</h3>
        <span className="text-xs text-text-tertiary">{product.variants.length}</span>
      </div>

      <div className="mt-4 space-y-2">
        {product.variants.map((variant) => (
          <article key={variant.id} className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-text">{variant.sku}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {[variant.size, variant.thickness, variant.color].filter(Boolean).join(" / ") || t("noVariantDetails")}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(variant.price)} đ
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => edit(variant)}>
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className={dangerButtonClass}
                disabled={deletingId === variant.id}
                onClick={() => void remove(variant)}
              >
                {deletingId === variant.id ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <input className={fieldClass} placeholder="SKU *" value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} />
        <input className={fieldClass} placeholder={t("size")} value={draft.size} onChange={(event) => setDraft({ ...draft, size: event.target.value })} />
        <input className={fieldClass} placeholder={t("thickness")} value={draft.thickness} onChange={(event) => setDraft({ ...draft, thickness: event.target.value })} />
        <input className={fieldClass} placeholder={t("color")} value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
        <input className={fieldClass} type="number" min="50000" max="500000" step="1000" placeholder={t("price")} value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={primaryButtonClass} disabled={isSaving} onClick={() => void save()}>
          {isSaving ? <LoaderCircle className="animate-spin" size={16} /> : editingId ? <Save size={16} /> : <Plus size={16} />}
          {editingId ? t("updateVariant") : t("addVariant")}
        </button>
        {editingId && (
          <button type="button" className={secondaryButtonClass} onClick={reset}>
            <X size={16} /> {t("cancel")}
          </button>
        )}
      </div>
    </section>
  );
}
