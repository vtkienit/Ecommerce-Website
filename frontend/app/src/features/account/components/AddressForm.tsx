import { useState, type FormEvent } from "react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { ApiError } from "../../../shared/api/httpClient";
import VietnameseAddressFields from "../../address/components/VietnameseAddressFields";
import type { VietnameseAddress } from "../../address/model/addressTypes";
import { updateStoredUser } from "../../auth/model/authSession";
import type { AuthUser } from "../../auth/model/authTypes";
import { updateAddress } from "../api/accountApi";
import { FormFooter, SectionHeading } from "./AccountFormParts";

export default function AddressForm({ user, onUserChange }: {
  user: AuthUser;
  onUserChange: (user: AuthUser) => void;
}) {
  const { t } = useLanguage();
  const [address, setAddress] = useState<VietnameseAddress>({
    provinceCode: user.provinceCode,
    provinceName: user.provinceName ?? "",
    wardCode: user.wardCode,
    wardName: user.wardName ?? "",
    addressLine: user.addressLine ?? user.address ?? "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      address.provinceCode === null
      || address.wardCode === null
      || !address.addressLine.trim()
    ) {
      setError(t("addressRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateAddress({
        ...address,
        addressLine: address.addressLine.trim(),
      });
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
        <VietnameseAddressFields value={address} onChange={setAddress} />
      </div>
      <FormFooter error={error} success={success} isSaving={isSaving} buttonText={t("saveAddress")} />
    </form>
  );
}
