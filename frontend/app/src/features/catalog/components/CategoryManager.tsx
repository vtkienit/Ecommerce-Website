import { useMemo, useState } from "react";
import { LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import AdminPagination from "../../../shared/components/AdminPagination";
import type { Category } from "../model/catalogTypes";
import { createCategory, deleteCategory, updateCategory } from "../api/catalogAdminApi";
import { dangerButtonClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "./adminCatalogStyles";

type Props = {
  categories: Category[];
  onChange: (categories: Category[]) => void;
  onMessage: (message: string, error?: boolean) => void;
};

export default function CategoryManager({ categories, onChange, onMessage }: Props) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const totalPages = Math.ceil(categories.length / pageSize);
  const visibleCategories = useMemo(
    () => categories.slice(page * pageSize, (page + 1) * pageSize),
    [categories, page],
  );

  const reset = () => {
    setEditingId(null);
    setName("");
    setSlug("");
  };

  const edit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
  };

  const save = async () => {
    if (!name.trim()) {
      onMessage(t("categoryNameRequired"), true);
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingId
        ? await updateCategory(editingId, { name, slug })
        : await createCategory({ name, slug });
      const next = editingId
        ? categories.map((category) => category.id === saved.id ? saved : category)
        : [...categories, saved];
      onChange(next.sort((first, second) => first.name.localeCompare(second.name)));
      onMessage(editingId ? t("categoryUpdated") : t("categoryCreated"));
      reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(t("deleteCategoryConfirm"))) return;

    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      onChange(categories.filter((item) => item.id !== category.id));
      onMessage(t("categoryDeleted"));
      if (editingId === category.id) reset();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
      <section className="rounded-xl border border-border bg-bg p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-text">
          {editingId ? t("editCategory") : t("addCategory")}
        </h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-text">
            {t("categoryName")}
            <input className={`${fieldClass} mt-1.5`} value={name} placeholder={t("categoryName")} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-text">
            Slug
            <input
              className={`${fieldClass} mt-1.5`}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder={t("slugAutoHint")}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryButtonClass} disabled={isSaving} onClick={() => void save()}>
              {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : editingId ? <Save size={17} /> : <Plus size={17} />}
              {editingId ? t("saveChanges") : t("addCategory")}
            </button>
            {editingId && (
              <button type="button" className={secondaryButtonClass} onClick={reset}>
                <X size={17} /> {t("cancel")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-semibold text-text">{t("categories")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{categories.length} {t("categoriesCount")}</p>
        </div>
        <div className="divide-y divide-border">
          {visibleCategories.map((category) => (
            <article key={category.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="font-semibold text-text">{category.name}</p>
                <p className="mt-0.5 text-sm text-text-tertiary">/{category.slug} · {category.productCount} {t("productsLabel")}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={secondaryButtonClass} onClick={() => edit(category)}>
                  <Pencil size={16} /> {t("edit")}
                </button>
                <button
                  type="button"
                  className={dangerButtonClass}
                  disabled={deletingId === category.id}
                  onClick={() => void remove(category)}
                >
                  {deletingId === category.id ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  {t("delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="px-5 pb-5">
          <AdminPagination page={page} totalPages={totalPages} totalElements={categories.length} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}
