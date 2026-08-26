import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import { useLanguage } from "./LanguageContext";
import { ConfirmDialogContext, type ConfirmDialogOptions } from "./ConfirmDialogContext";

type PendingConfirmation = Required<ConfirmDialogOptions>;

export default function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [dialog, setDialog] = useState<PendingConfirmation | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const requestConfirmation = useCallback((options: ConfirmDialogOptions) => {
    resolverRef.current?.(false);
    setDialog({
      title: options.title ?? t("confirmActionTitle"),
      message: options.message,
      confirmLabel: options.confirmLabel ?? t("confirm"),
      cancelLabel: options.cancelLabel ?? t("cancel"),
      tone: options.tone ?? "primary",
    });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, [t]);

  useEffect(() => () => resolverRef.current?.(false), []);

  const value = useMemo(() => requestConfirmation, [requestConfirmation]);
  const confirmDialog = useCallback(() => close(true), [close]);
  const cancelDialog = useCallback(() => close(false), [close]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        confirmLabel={dialog?.confirmLabel ?? ""}
        cancelLabel={dialog?.cancelLabel ?? ""}
        tone={dialog?.tone ?? "primary"}
        onConfirm={confirmDialog}
        onCancel={cancelDialog}
      />
    </ConfirmDialogContext.Provider>
  );
}
