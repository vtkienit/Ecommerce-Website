import { CircleAlert, LoaderCircle, PackageOpen } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";

type CatalogStatusProps = {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  compact?: boolean;
};

export default function CatalogStatus({
  loading = false,
  error = "",
  empty = false,
  compact = false,
}: CatalogStatusProps) {
  const { t } = useLanguage();

  if (!loading && !error && !empty) return null;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-36" : "min-h-72"}`}>
      {loading ? (
        <LoaderCircle className="animate-spin text-primary" size={28} />
      ) : error ? (
        <CircleAlert className="text-red-500" size={30} />
      ) : (
        <PackageOpen className="text-text-tertiary" size={34} />
      )}
      <p className="mt-3 text-sm text-text-secondary">
        {loading ? t("catalogLoading") : error ? t("catalogError") : t("catalogEmpty")}
      </p>
    </div>
  );
}
