import { useCallback, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../contexts/LanguageContext";
import {
  authenticateWithGoogle,
  login,
  register,
  saveAuthSession,
} from "../services/auth";
import GoogleAuthButton from "./GoogleAuthButton";

type AuthMode = "login" | "register";

type AuthPageProps = {
  mode: AuthMode;
};

type AuthFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthField = keyof AuthFields;
type AuthErrors = Partial<Record<AuthField, string>>;

const initialFields: AuthFields = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ mode }: AuthPageProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [fields, setFields] = useState<AuthFields>(initialFields);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const updateField = (field: AuthField, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAuthError("");
  };

  const validate = () => {
    const nextErrors: AuthErrors = {};

    if (isRegister && fields.name.trim().length < 2) {
      nextErrors.name = t("nameRequired");
    }

    if (!emailPattern.test(fields.email.trim())) {
      nextErrors.email = t("invalidEmail");
    }

    if (fields.password.length < 8) {
      nextErrors.password = t("passwordMin");
    }

    if (isRegister && fields.confirmPassword !== fields.password) {
      nextErrors.confirmPassword = t("passwordMismatch");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !validate()) {
      return;
    }

    setAuthError("");
    setIsSubmitting(true);

    try {
      const response = isRegister
        ? await register({
            name: fields.name.trim(),
            email: fields.email.trim(),
            password: fields.password,
          })
        : await login({
            email: fields.email.trim(),
            password: fields.password,
          });

      saveAuthSession(response, isRegister || rememberMe);
      navigate("/", { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t("authRequestFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      if (!credential || isSubmitting) {
        return;
      }

      setAuthError("");
      setIsSubmitting(true);

      try {
        const response = await authenticateWithGoogle(credential);
        saveAuthSession(response, isRegister || rememberMe);
        navigate("/", { replace: true });
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : t("authRequestFailed"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isRegister, isSubmitting, navigate, rememberMe, t],
  );

  return (
    <div className="relative min-h-screen bg-bg-subtle text-text">
      <Helmet>
        <title>{isRegister ? t("register") : t("login")} | QuyDung</title>
      </Helmet>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-44 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute left-[8%] top-[28%] hidden h-44 w-44 rounded-full border border-primary/10 lg:block" />
        <div className="absolute left-[11%] top-[34%] hidden h-24 w-24 rounded-full border border-primary/15 lg:block" />
        <div
          className="absolute right-[7%] top-[10%] hidden h-40 w-40 opacity-20 md:block"
          style={{
            backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <Link
        to="/"
        className="absolute left-3 top-5 z-20 flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:border-primary hover:text-primary lg:left-8 lg:top-7"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {t("home")}
      </Link>

      <main className="relative flex min-h-screen items-center overflow-hidden bg-bg-subtle">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-3 pb-12 pt-24 sm:py-16 lg:px-8 lg:py-20">
          <section className="mx-auto w-full max-w-[500px]">
            <div className="mb-7 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
                <Sparkles size={13} aria-hidden="true" />
                QuyDung
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                {isRegister ? t("authRegisterTitle") : t("authLoginTitle")}
              </h1>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-text-secondary">
                {isRegister ? t("authRegisterSubtitle") : t("authLoginSubtitle")}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-bg p-5 shadow-sm sm:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

              <div className={clsx(isSubmitting && "pointer-events-none opacity-60")}>
                <GoogleAuthButton mode={mode} onCredential={handleGoogleCredential} />
              </div>

              <div className="my-6 flex items-center gap-4" aria-hidden="true">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  {t("orContinueWith")}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                {isRegister && (
                  <AuthInput
                    id="name"
                    label={t("fullName")}
                    value={fields.name}
                    autoComplete="name"
                    icon={<UserRound size={19} />}
                    error={errors.name}
                    onChange={(value) => updateField("name", value)}
                  />
                )}

                <AuthInput
                  id="email"
                  type="email"
                  label={t("email")}
                  value={fields.email}
                  autoComplete="email"
                  inputMode="email"
                  icon={<Mail size={19} />}
                  error={errors.email}
                  onChange={(value) => updateField("email", value)}
                />

                <AuthInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label={t("password")}
                  value={fields.password}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  icon={<LockKeyhole size={19} />}
                  error={errors.password}
                  onChange={(value) => updateField("password", value)}
                  trailingAction={
                    <PasswordVisibilityButton
                      visible={showPassword}
                      label={t("togglePassword")}
                      onClick={() => setShowPassword((current) => !current)}
                    />
                  }
                />

                {isRegister && (
                  <AuthInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label={t("confirmPassword")}
                    value={fields.confirmPassword}
                    autoComplete="new-password"
                    icon={<LockKeyhole size={19} />}
                    error={errors.confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    trailingAction={
                      <PasswordVisibilityButton
                        visible={showConfirmPassword}
                        label={t("togglePassword")}
                        onClick={() => setShowConfirmPassword((current) => !current)}
                      />
                    }
                  />
                )}

                {!isRegister && (
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-text-secondary">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-primary"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                      {t("rememberMe")}
                    </label>
                    <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                      {t("forgotPassword")}
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
                  {isSubmitting ? t("authLoading") : isRegister ? t("createAccount") : t("login")}
                </button>
              </form>

              {authError && (
                <div className="mt-5 flex items-start gap-2 rounded-md border border-red-500/25 bg-red-500/8 p-3 text-sm leading-relaxed text-red-700 dark:text-red-300" role="alert">
                  <CircleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-text-secondary">
              {isRegister ? t("hasAccount") : t("noAccount")} {" "}
              <Link
                to={isRegister ? "/login" : "/register"}
                className="font-semibold text-primary hover:underline"
              >
                {isRegister ? t("login") : t("register")}
              </Link>
            </p>

            <div className="mt-8 grid grid-cols-3 gap-2">
              <AuthTrustItem icon={<ShieldCheck size={16} />} label={t("highQuality")} />
              <AuthTrustItem icon={<Truck size={16} />} label={t("fastDelivery")} />
              <AuthTrustItem icon={<CheckCircle2 size={16} />} label={t("warranty")} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

type AuthInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  error?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  inputMode?: "email";
  trailingAction?: ReactNode;
};

function AuthInput({
  id,
  label,
  value,
  onChange,
  icon,
  error,
  type = "text",
  autoComplete,
  inputMode,
  trailingAction,
}: AuthInputProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            "h-12 w-full rounded-md border bg-bg pl-11 text-text outline-none transition placeholder:text-text-muted focus:ring-4",
            trailingAction ? "pr-12" : "pr-4",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-border focus:border-primary focus:ring-primary/10",
          )}
        />
        {trailingAction && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailingAction}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordVisibilityButton({
  visible,
  label,
  onClick,
}: {
  visible: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-primary"
      aria-label={label}
      onClick={onClick}
    >
      {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
    </button>
  );
}

function AuthTrustItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-bg px-2 py-2 text-center text-xs font-medium text-text-secondary shadow-sm">
      <span className="shrink-0 text-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </div>
  );
}
