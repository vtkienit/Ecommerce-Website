import { useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { ApiError } from "../../../shared/api/httpClient";
import { updateStoredUser } from "../../auth/model/authSession";
import type { AuthUser } from "../../auth/model/authTypes";
import { updateAddress } from "../api/accountApi";
import { FormFooter, ProfileField, SectionHeading } from "./AccountFormParts";

export default function AddressForm({ user, onUserChange }: {
  user: AuthUser;
  onUserChange: (user: AuthUser) => void;
}) {
  const { t } = useLanguage();
  const [address, setAddress] = useState(user.address ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!address.trim()) {
      setError(t("addressRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateAddress(address.trim());
      updateStoredUser(updatedUser);
      onUserChange(updatedUser);
      setSuccess(t("addressUpdated"));
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
      <SectionHeading title={t("addressTitle")} subtitle={t("addressSubtitle")} />
      <div className="p-5 sm:p-7">
        <ProfileField label={t("deliveryAddress")} icon={<MapPin size={16} />}>
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-lg border border-border bg-bg p-3.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={address}
            maxLength={500}
            placeholder={t("addressPlaceholder")}
            onChange={(event) => setAddress(event.target.value)}
          />
        </ProfileField>
      </div>
      <FormFooter error={error} success={success} isSaving={isSaving} buttonText={t("saveAddress")} />
    </form>
  );
}
