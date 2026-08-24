import type { ReactNode } from "react";
import { LoaderCircle, Save } from "lucide-react";

export const accountInputClass =
  "mt-2 h-11 w-full rounded-lg border border-border bg-bg px-3.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:text-text-tertiary";

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="border-b border-border px-5 py-5 sm:px-7">
      <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{title}</h1>
      <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>
    </header>
  );
}

export function ProfileField({ label, icon, children }: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-text">
      <span className="flex items-center gap-2">
        <span className="text-text-tertiary">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

export function FormFooter({ error, success, isSaving, buttonText }: {
  error: string;
  success: string;
  isSaving: boolean;
  buttonText: string;
}) {
  return (
    <footer className="flex flex-col gap-3 border-t border-border bg-bg-secondary/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div aria-live="polite" className="text-sm">
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
        {buttonText}
      </button>
    </footer>
  );
}
