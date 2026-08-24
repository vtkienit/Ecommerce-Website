import { useState } from "react";
import { Check, ImagePlus, LoaderCircle, Pencil, Save, Trash2, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { createImage, deleteImage, updateImage } from "../api/catalogAdminApi";
import type { AdminImage, AdminProduct } from "../model/catalogAdminTypes";
import { dangerButtonClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "./adminCatalogStyles";

type Props = {
  product: AdminProduct;
  onChange: (product: AdminProduct) => void;
  onMessage: (message: string, error?: boolean) => void;
};

export default function ImageManager({ product, onChange, onMessage }: Props) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [primary, setPrimary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reset = () => {
    setEditingId(null);
    setImageUrl("");
    setPrimary(false);
  };

  const edit = (image: AdminImage) => {
    setEditingId(image.id);
    setImageUrl(image.imageUrl);
    setPrimary(image.primary);
  };

  const save = async () => {
    if (!imageUrl.trim()) {
      onMessage(t("imageUrlRequired"), true);
      return;
    }

    setIsSaving(true);
    try {
      const payload = { imageUrl, primary };
      const saved = editingId
        ? await updateImage(editingId, payload)
        : await createImage(product.id, payload);
      onChange(saved);
      onMessage(editingId ? t("imageUpdated") : t("imageCreated"));
      reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (image: AdminImage) => {
    if (!window.confirm(t("deleteImageConfirm"))) return;

    setDeletingId(image.id);
    try {
      onChange(await deleteImage(image.id));
      onMessage(t("imageDeleted"));
      if (editingId === image.id) reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-text">{t("productImages")}</h3>
        <span className="text-xs text-text-tertiary">{product.images.length}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {product.images.map((image) => (
          <article key={image.id} className="overflow-hidden rounded-lg border border-border bg-bg">
            <div className="relative aspect-[16/10] bg-bg-secondary">
              <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
              {image.primary && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">
                  <Check size={12} /> {t("primaryImage")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 p-2">
              <button type="button" className={`${secondaryButtonClass} flex-1`} onClick={() => edit(image)}>
                <Pencil size={15} /> {t("edit")}
              </button>
              <button
                type="button"
                className={dangerButtonClass}
                disabled={deletingId === image.id}
                onClick={() => void remove(image)}
              >
                {deletingId === image.id ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className={`${fieldClass} flex-1`}
          placeholder={t("imageUrl")}
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" className="accent-primary" checked={primary} onChange={(event) => setPrimary(event.target.checked)} />
          {t("setPrimaryImage")}
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={primaryButtonClass} disabled={isSaving} onClick={() => void save()}>
          {isSaving ? <LoaderCircle className="animate-spin" size={16} /> : editingId ? <Save size={16} /> : <ImagePlus size={16} />}
          {editingId ? t("updateImage") : t("addImage")}
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
