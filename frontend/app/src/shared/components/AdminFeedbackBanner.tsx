import { CircleAlert, CircleCheck } from "lucide-react";

type AdminFeedbackBannerProps = {
  type: "error" | "success";
  message: string;
  className?: string;
};

export default function AdminFeedbackBanner({
  type,
  message,
  className = "mt-4",
}: AdminFeedbackBannerProps) {
  const isError = type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`${className} flex items-start gap-3 rounded-lg border border-l-4 px-4 py-3 text-sm font-medium text-text shadow-sm ${
        isError
          ? "border-red-200 border-l-red-600 bg-red-50/80 dark:border-red-900 dark:border-l-red-400 dark:bg-red-950/30"
          : "border-emerald-200 border-l-emerald-600 bg-emerald-50/80 dark:border-emerald-900 dark:border-l-emerald-400 dark:bg-emerald-950/30"
      }`}
    >
      <Icon
        size={19}
        className={`mt-0.5 shrink-0 ${isError ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}
        aria-hidden="true"
      />
      <span className="min-w-0 leading-5">{message}</span>
    </div>
  );
}
