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
      className={`${className} flex items-center gap-3 rounded-lg border border-border border-l-4 bg-bg px-4 py-3 text-sm font-medium text-text shadow-sm ${
        isError ? "border-l-rose-600" : "border-l-emerald-600"
      }`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
        isError ? "bg-rose-600" : "bg-emerald-600"
      }`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-5">{message}</span>
    </div>
  );
}
