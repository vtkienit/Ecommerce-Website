import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useLanguage } from "../contexts/LanguageContext";
import { getStoredUser } from "../services/auth";

export default function Profile() {
  const { t } = useLanguage();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{t("profile")} | QuyDung</title>
      </Helmet>

      <main className="min-h-[60vh] bg-bg-subtle px-3 py-12 lg:px-8 lg:py-16">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

          <div className="px-5 pb-8 sm:px-8">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-bg bg-primary text-2xl font-semibold uppercase text-white shadow-sm">
              {user.name.trim().charAt(0) || <UserRound size={30} aria-hidden="true" />}
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {t("accountInformation")}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">
                {user.name}
              </h1>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-bg-secondary p-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-text-tertiary">
                  <Mail size={17} aria-hidden="true" />
                  {t("email")}
                </dt>
                <dd className="mt-2 break-all font-medium text-text">{user.email}</dd>
              </div>

              <div className="rounded-lg border border-border bg-bg-secondary p-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-text-tertiary">
                  <ShieldCheck size={17} aria-hidden="true" />
                  {t("role")}
                </dt>
                <dd className="mt-2 font-medium capitalize text-text">{user.role}</dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
