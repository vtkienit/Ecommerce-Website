import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, CircleHelp, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onCancel, open]);

  if (!open) return null;

  const isDanger = tone === "danger";
  const Icon = isDanger ? CircleAlert : CircleHelp;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl"
      >
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isDanger ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-primary/10 text-primary"
          }`}>
            <Icon size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-text">{title}</h2>
            <p id={descriptionId} className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text"
          >
            <X size={19} />
          </button>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-border bg-bg-secondary/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-border bg-bg px-5 text-sm font-semibold text-text transition-colors hover:bg-bg-tertiary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-lg px-5 text-sm font-semibold text-white transition-all hover:shadow-md active:translate-y-px ${
              isDanger ? "bg-rose-600 hover:bg-rose-700" : "bg-primary hover:brightness-95"
            }`}
          >
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
