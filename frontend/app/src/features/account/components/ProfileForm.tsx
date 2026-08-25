import { useState, type FormEvent, type ReactNode } from "react";
import { CalendarDays, Mars, Phone, UserRound, Venus } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { ApiError } from "../../../shared/api/httpClient";
import { updateStoredUser } from "../../auth/model/authSession";
import type { AuthUser } from "../../auth/model/authTypes";
import { updateProfile } from "../api/accountApi";
import type { ProfileUpdateRequest } from "../model/accountTypes";
import {
  accountInputClass,
  FormFooter,
  ProfileField,
  SectionHeading,
} from "./AccountFormParts";

type Gender = "MALE" | "FEMALE" | "OTHER";

export default function ProfileForm({ user, onUserChange }: {
  user: AuthUser;
  onUserChange: (user: AuthUser) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<ProfileUpdateRequest>({
    name: user.name,
    phone: user.phone ?? "",
    gender: user.gender ?? "",
    dateOfBirth: user.dateOfBirth ?? null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.name.trim().length < 2) {
      setError(t("nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateProfile({ ...form, name: form.name.trim() });
      updateStoredUser(updatedUser);
      onUserChange(updatedUser);
      setSuccess(t("profileUpdated"));
    } catch (requestError) {
      setError(requestError instanceof ApiError
        ? requestError.message
        : t("profileUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <SectionHeading title={t("profileTitle")} subtitle={t("profileSubtitle")} />

      <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
        <ProfileField label={t("fullName")} icon={<UserRound size={16} />}>
          <input
            className={accountInputClass}
            value={form.name}
            placeholder={t("fullName")}
            maxLength={100}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </ProfileField>

        <ProfileField label={t("email")} icon={<span className="text-xs">@</span>}>
          <input className={accountInputClass} value={user.email} placeholder={t("email")} disabled />
        </ProfileField>

        <ProfileField label={t("phoneNumber")} icon={<Phone size={16} />}>
          <input
            className={accountInputClass}
            type="tel"
            value={form.phone}
            maxLength={20}
            placeholder={t("phonePlaceholder")}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </ProfileField>

        <ProfileField label={t("dateOfBirth")} icon={<CalendarDays size={16} />}>
          <input
            className={accountInputClass}
            type="date"
            value={form.dateOfBirth ?? ""}
            placeholder={t("dateOfBirth")}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value || null })}
          />
        </ProfileField>

        <fieldset className="md:col-span-2">
          <legend className="flex items-center gap-2 text-sm font-medium text-text">
            <UserRound size={16} className="text-text-tertiary" />
            {t("gender")}
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <GenderOption label={t("male")} value="MALE" checked={form.gender === "MALE"} icon={<Mars size={17} />} onChange={(gender) => setForm({ ...form, gender })} />
            <GenderOption label={t("female")} value="FEMALE" checked={form.gender === "FEMALE"} icon={<Venus size={17} />} onChange={(gender) => setForm({ ...form, gender })} />
            <GenderOption label={t("otherGender")} value="OTHER" checked={form.gender === "OTHER"} icon={<UserRound size={17} />} onChange={(gender) => setForm({ ...form, gender })} />
          </div>
        </fieldset>
      </div>

      <FormFooter error={error} success={success} isSaving={isSaving} buttonText={t("saveChanges")} />
    </form>
  );
}

function GenderOption({ label, value, checked, icon, onChange }: {
  label: string;
  value: Gender;
  checked: boolean;
  icon: ReactNode;
  onChange: (value: Gender) => void;
}) {
  return (
    <label className={clsx(
      "flex min-w-28 cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition",
      checked
        ? "border-primary bg-primary/5 text-primary"
        : "border-border text-text-secondary hover:border-primary/50",
    )}>
      <input className="sr-only" type="radio" name="gender" value={value} checked={checked} onChange={() => onChange(value)} />
      {icon}
      {label}
    </label>
  );
}
