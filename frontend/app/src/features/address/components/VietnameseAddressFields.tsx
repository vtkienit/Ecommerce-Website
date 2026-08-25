import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import SearchableSelect, { type SelectOption } from "../../../shared/components/SearchableSelect";
import { getProvinces, getWards } from "../api/vietnamAddressApi";
import type { Province, VietnameseAddress, Ward } from "../model/addressTypes";

type VietnameseAddressFieldsProps = {
  value: VietnameseAddress;
  onChange: (value: VietnameseAddress) => void;
  compact?: boolean;
};

export default function VietnameseAddressFields({
  value,
  onChange,
  compact = false,
}: VietnameseAddressFieldsProps) {
  const { t } = useLanguage();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [loadedProvinceCode, setLoadedProvinceCode] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    getProvinces()
      .then((data) => {
        if (active) setProvinces(data);
      })
      .catch(() => {
        if (active) setLoadError(t("addressDataUnavailable"));
      })
      .finally(() => {
        if (active) setIsLoadingProvinces(false);
      });

    return () => { active = false; };
  }, [t]);

  useEffect(() => {
    if (value.provinceCode === null) return;

    let active = true;
    const provinceCode = value.provinceCode;

    getWards(provinceCode)
      .then((data) => {
        if (active) {
          setWards(data);
          setLoadedProvinceCode(provinceCode);
          setLoadError("");
        }
      })
      .catch(() => {
        if (active) {
          setWards([]);
          setLoadedProvinceCode(provinceCode);
          setLoadError(t("addressDataUnavailable"));
        }
      });

    return () => { active = false; };
  }, [t, value.provinceCode]);

  const provinceOptions = useMemo<SelectOption[]>(() => provinces.map((province) => ({
    value: province.code,
    label: province.name,
  })), [provinces]);
  const wardOptions = useMemo<SelectOption[]>(() => (
    loadedProvinceCode === value.provinceCode
      ? wards.map((ward) => ({ value: ward.code, label: ward.name }))
      : []
  ), [loadedProvinceCode, value.provinceCode, wards]);
  const isLoadingWards = value.provinceCode !== null && loadedProvinceCode !== value.provinceCode;

  return (
    <div className="space-y-4">
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <AddressFieldLabel label={t("provinceCity")}>
          <SearchableSelect
            value={value.provinceCode}
            options={provinceOptions}
            placeholder={t("selectProvinceCity")}
            searchPlaceholder={t("searchProvinceCity")}
            emptyMessage={t("addressNoResults")}
            loading={isLoadingProvinces}
            onChange={(option) => onChange({
              ...value,
              provinceCode: option.value,
              provinceName: option.label,
              wardCode: null,
              wardName: "",
            })}
          />
        </AddressFieldLabel>

        <AddressFieldLabel label={t("wardCommune")}>
          <SearchableSelect
            value={value.wardCode}
            options={wardOptions}
            placeholder={value.provinceCode === null ? t("selectProvinceFirst") : t("selectWardCommune")}
            searchPlaceholder={t("searchWardCommune")}
            emptyMessage={t("addressNoResults")}
            loading={isLoadingWards}
            disabled={value.provinceCode === null}
            onChange={(option) => onChange({
              ...value,
              wardCode: option.value,
              wardName: option.label,
            })}
          />
        </AddressFieldLabel>
      </div>

      <AddressFieldLabel label={t("addressLine")}>
        <div className="relative mt-2">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={17} />
          <input
            value={value.addressLine}
            maxLength={255}
            placeholder={t("addressLinePlaceholder")}
            onChange={(event) => onChange({ ...value, addressLine: event.target.value })}
            className="h-11 w-full rounded-lg border border-border bg-bg pl-10 pr-3.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
        </div>
      </AddressFieldLabel>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
    </div>
  );
}

function AddressFieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block text-sm font-medium text-text-secondary">
      <span>{label}</span>
      {children}
    </div>
  );
}
