import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LoaderCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { ApiError } from "../../../shared/api/httpClient";
import MainLayout from "../../../shared/layouts/MainLayout";
import {
  clearAuthSession,
  getStoredUser,
  updateStoredUser,
} from "../../auth/model/authSession";
import type { AuthUser } from "../../auth/model/authTypes";
import { getCurrentProfile } from "../api/accountApi";
import AccountSidebar from "./AccountSidebar";
import AddressForm from "./AddressForm";
import ProfileForm from "./ProfileForm";
import PurchaseList from "./PurchaseList";

export type AccountSection = "profile" | "address" | "purchases";

type AccountCenterProps = {
  section?: AccountSection;
};

export default function AccountCenter({ section = "profile" }: AccountCenterProps) {
  const { t } = useLanguage();
  const storedUser = getStoredUser();
  const [user, setUser] = useState<AuthUser | null>(storedUser);
  const [isLoading, setIsLoading] = useState(Boolean(storedUser));

  useEffect(() => {
    let active = true;

    getCurrentProfile()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        updateStoredUser(currentUser);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!storedUser && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{t(section === "purchases" ? "myPurchase" : "myAccount")} | QuyDung</title>
      </Helmet>

      <main className="min-h-[65vh] bg-bg-subtle px-3 py-8 sm:px-5 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7">
          <AccountSidebar user={user} />

          <section className="min-h-[500px] overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
            {isLoading || !user ? (
              <div className="flex min-h-[500px] items-center justify-center gap-2 text-sm text-text-secondary">
                <LoaderCircle className="animate-spin text-primary" size={20} />
                {t("loadingProfile")}
              </div>
            ) : section === "profile" ? (
              <ProfileForm user={user} onUserChange={setUser} />
            ) : section === "address" ? (
              <AddressForm user={user} onUserChange={setUser} />
            ) : (
              <PurchaseList />
            )}
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
