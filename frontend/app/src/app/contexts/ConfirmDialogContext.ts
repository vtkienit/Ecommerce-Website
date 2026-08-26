import { createContext, useContext } from "react";

export type ConfirmDialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

export type ConfirmDialogContextValue = (options: ConfirmDialogOptions) => Promise<boolean>;

export const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used inside ConfirmDialogProvider");
  }
  return context;
};
