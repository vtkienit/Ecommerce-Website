import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../app/contexts/LanguageContext";

type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  onChange: (page: number) => void;
  alwaysVisible?: boolean;
};

export default function AdminPagination({
  page,
  totalPages,
  totalElements,
  onChange,
  alwaysVisible = false,
}: Props) {
  const { t } = useLanguage();
  if (totalPages <= 1 && !alwaysVisible) return null;
  const displayedTotalPages = Math.max(1, totalPages);

  return (
    <nav className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3 sm:flex-row" aria-label={t("pagination")}>
      <p className="text-sm text-text-secondary">
        {t("totalRecords").replace("{count}", String(totalElements))}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-text-secondary hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("previousPage")}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-24 text-center text-sm font-semibold text-text">
          {t("pageOf").replace("{page}", String(page + 1)).replace("{total}", String(displayedTotalPages))}
        </span>
        <button
          type="button"
          disabled={page + 1 >= displayedTotalPages}
          onClick={() => onChange(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-text-secondary hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("nextPage")}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
