import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

type AdminFeedbackBannerProps = {
  type: "error" | "success" | "warning";
  message: string;
  className?: string;
};

export default function AdminFeedbackBanner({
  type,
  message,
  className = "mt-4",
}: AdminFeedbackBannerProps) {
  const style = {
    error: {
      Icon: CircleAlert,
      accent: "border-l-rose-600",
      icon: "bg-rose-600",
    },
    success: {
      Icon: CircleCheck,
      accent: "border-l-emerald-600",
      icon: "bg-emerald-600",
    },
    warning: {
      Icon: TriangleAlert,
      accent: "border-l-amber-500",
      icon: "bg-amber-500 text-amber-950",
    },
  }[type];
  const Icon = style.Icon;

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      className={`${className} flex items-center gap-3 rounded-lg border border-border border-l-4 bg-bg px-4 py-3 text-sm font-medium text-text shadow-sm ${style.accent}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${style.icon}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-5">{message}</span>
    </div>
  );
}
