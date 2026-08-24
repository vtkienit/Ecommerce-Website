import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../contexts/LanguageContext";
import {
  AuthApiError,
  clearAuthSession,
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from "../services/auth";

type Step = "email" | "code" | "password" | "done";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);

  useEffect(() => {
    if (step !== "code") {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    if (step === "email" && !emailPattern.test(email.trim())) {
      setError(t("invalidEmail"));
      return;
    }

    if (step === "code") {
      if (remainingSeconds === 0) {
        setError(t("resetCodeExpired"));
        return;
      }

      if (remainingAttempts === 0) {
        setError(t("resetCodeNoAttempts"));
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        setError(t("resetCodeInvalid"));
        return;
      }
    }

    if (step === "password") {
      if (newPassword.length < 8) {
        setError(t("passwordMin"));
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(t("passwordMismatch"));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (step === "email") {
        const response = await requestPasswordReset(email.trim());
        setRemainingSeconds(response.expiresInSeconds);
        setRemainingAttempts(response.maxAttempts);
        setMaxAttempts(response.maxAttempts);
        setStep("code");
      } else if (step === "code") {
        const response = await verifyPasswordResetCode(email.trim(), code);
        setResetToken(response.resetToken);
        setStep("password");
      } else if (step === "password") {
        await resetPassword(resetToken, newPassword, confirmPassword);
        clearAuthSession();
        setStep("done");
      }
    } catch (requestError) {
      if (requestError instanceof AuthApiError && requestError.status === 404) {
        setError(t("emailNotRegistered"));
      } else if (
        requestError instanceof AuthApiError
        && requestError.status === 400
        && typeof requestError.remainingAttempts === "number"
      ) {
        setRemainingAttempts(requestError.remainingAttempts);
        setError(
          requestError.remainingAttempts > 0
            ? t("resetCodeIncorrect").replace("{count}", String(requestError.remainingAttempts))
            : t("resetCodeNoAttempts"),
        );
      } else {
        setError(requestError instanceof Error ? requestError.message : t("resetRequestFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = step === "email"
    ? t("forgotPasswordTitle")
    : step === "code"
      ? t("verifyCodeTitle")
      : step === "password"
        ? t("newPasswordTitle")
        : t("passwordResetDoneTitle");

  const subtitle = step === "email"
    ? t("forgotPasswordSubtitle")
    : step === "code"
      ? t("verifyCodeSubtitle")
      : step === "password"
        ? t("newPasswordSubtitle")
        : t("passwordResetDoneSubtitle");

  const countdown = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-subtle text-text">
      <Helmet>
        <title>{t("forgotPassword")} | QuyDung</title>
      </Helmet>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-44 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      <Link
        to={step === "email" || step === "done" ? "/login" : "#"}
        onClick={(event) => {
          if (step !== "email" && step !== "done") {
            event.preventDefault();
            setError("");
            setCode("");
            setResetToken("");
            setRemainingSeconds(0);
            setRemainingAttempts(0);
            setMaxAttempts(0);
            setStep("email");
          }
        }}
        className="absolute left-3 top-5 z-20 flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors hover:border-primary hover:text-primary lg:left-8 lg:top-7"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {step === "email" || step === "done" ? t("backToLogin") : t("back")}
      </Link>

      <main className="relative flex min-h-screen items-center px-3 pb-12 pt-24 sm:py-16">
        <section className="mx-auto w-full max-w-[500px]">
          <div className="mb-7 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
              <ShieldCheck size={14} aria-hidden="true" />
              {t("accountRecovery")}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-text-secondary">{subtitle}</p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border bg-bg p-5 shadow-sm sm:p-8">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            {step !== "done" && (
              <div className="mb-7 grid grid-cols-3 gap-2" aria-label={t("resetProgress")}>
                {["email", "code", "password"].map((item, index) => {
                  const currentIndex = ["email", "code", "password"].indexOf(step);
                  return (
                    <span
                      key={item}
                      className={clsx(
                        "h-1.5 rounded-full transition-colors",
                        index <= currentIndex ? "bg-primary" : "bg-bg-tertiary",
                      )}
                    />
                  );
                })}
              </div>
            )}

            {step === "done" ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 size={34} aria-hidden="true" />
                </div>
                <Link
                  to="/login"
                  className="mt-7 flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  {t("loginNow")}
                </Link>
              </div>
            ) : (
              <form className="space-y-5" noValidate onSubmit={submit}>
                {step === "email" && (
                  <ResetInput
                    id="reset-email"
                    type="email"
                    label={t("email")}
                    value={email}
                    autoComplete="email"
                    icon={<Mail size={19} />}
                    onChange={(value) => {
                      setEmail(value);
                      setError("");
                    }}
                  />
                )}

                {step === "code" && (
                  <>
                    <div className="rounded-md border border-primary/15 bg-primary/5 p-3 text-sm text-text-secondary">
                      {t("codeSentTo")} <span className="font-semibold text-text">{email}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className={remainingSeconds === 0 ? "font-medium text-red-600" : "text-text-secondary"}>
                        {remainingSeconds === 0
                          ? t("resetCodeExpired")
                          : <>{t("codeExpiresIn")} <strong className="text-primary">{countdown}</strong></>}
                      </span>
                      <span className={remainingAttempts === 0 ? "font-medium text-red-600" : "text-text-secondary"}>
                        {t("attemptsRemaining")
                          .replace("{count}", String(remainingAttempts))
                          .replace("{max}", String(maxAttempts))}
                      </span>
                    </div>
                    <ResetInput
                      id="reset-code"
                      label={t("resetCode")}
                      value={code}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      centered
                      disabled={remainingSeconds === 0 || remainingAttempts === 0}
                      icon={<KeyRound size={19} />}
                      onChange={(value) => {
                        setCode(value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                    />
                  </>
                )}

                {step === "password" && (
                  <>
                    <ResetInput
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      label={t("newPassword")}
                      value={newPassword}
                      autoComplete="new-password"
                      icon={<LockKeyhole size={19} />}
                      onChange={(value) => {
                        setNewPassword(value);
                        setError("");
                      }}
                      action={
                        <VisibilityButton
                          visible={showPassword}
                          label={t("togglePassword")}
                          onClick={() => setShowPassword((current) => !current)}
                        />
                      }
                    />
                    <ResetInput
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      label={t("confirmNewPassword")}
                      value={confirmPassword}
                      autoComplete="new-password"
                      icon={<LockKeyhole size={19} />}
                      onChange={(value) => {
                        setConfirmPassword(value);
                        setError("");
                      }}
                      action={
                        <VisibilityButton
                          visible={showConfirmPassword}
                          label={t("togglePassword")}
                          onClick={() => setShowConfirmPassword((current) => !current)}
                        />
                      }
                    />
                  </>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-red-500/25 bg-red-500/8 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
                    <CircleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                    || (step === "code" && (remainingSeconds === 0 || remainingAttempts === 0))
                  }
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
                  {isSubmitting
                    ? t("authLoading")
                    : step === "email"
                      ? t("sendResetCode")
                      : step === "code"
                        ? t("verifyCode")
                        : t("saveNewPassword")}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

type ResetInputProps = {
  id: string;
  label: string;
  value: string;
  icon: ReactNode;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  inputMode?: "numeric";
  maxLength?: number;
  centered?: boolean;
  disabled?: boolean;
  action?: ReactNode;
};

function ResetInput({
  id,
  label,
  value,
  icon,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  centered,
  disabled,
  action,
}: ResetInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            "h-12 w-full rounded-md border border-border bg-bg pl-11 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:opacity-60",
            action ? "pr-12" : "pr-4",
            centered && "text-center text-lg font-semibold tracking-[0.35em]",
          )}
        />
        {action && <div className="absolute right-2 top-1/2 -translate-y-1/2">{action}</div>}
      </div>
    </div>
  );
}

function VisibilityButton({
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
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-text-tertiary hover:bg-bg-secondary hover:text-primary"
      aria-label={label}
      onClick={onClick}
    >
      {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
    </button>
  );
}
