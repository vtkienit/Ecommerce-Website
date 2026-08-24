import type { ReactNode } from "react";
import { ChevronRight, ClipboardList, MapPin, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import type { AuthUser } from "../../auth/model/authTypes";

export default function AccountSidebar({ user }: { user: AuthUser | null }) {
  const { t } = useLanguage();
  const initial = user?.name.trim().charAt(0).toUpperCase();

  return (
    <aside className="h-fit rounded-xl border border-border bg-bg p-4 shadow-sm lg:sticky lg:top-5">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-sm">
          {initial || <UserRound size={23} />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{user?.name}</p>
          <p className="truncate text-xs text-text-tertiary">{user?.email}</p>
        </div>
      </div>

      <nav className="mt-4" aria-label={t("accountMenu")}>
        <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-text">
          <UserRound size={18} className="text-primary" />
          {t("myAccount")}
        </div>
        <div className="ml-4 border-l border-border pl-3">
          <AccountLink to="/profile" end icon={<UserRound size={16} />}>
            {t("profile")}
          </AccountLink>
          <AccountLink to="/profile/address" icon={<MapPin size={16} />}>
            {t("address")}
          </AccountLink>
        </div>

        <div className="mt-2">
          <AccountLink to="/purchases" icon={<ClipboardList size={18} />} prominent>
            {t("myPurchase")}
          </AccountLink>
        </div>
      </nav>
    </aside>
  );
}

function AccountLink({
  to,
  end,
  icon,
  children,
  prominent = false,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  children: ReactNode;
  prominent?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
          prominent && "font-semibold",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-text-secondary hover:bg-bg-secondary hover:text-text",
        )
      }
    >
      {icon}
      <span className="flex-1">{children}</span>
      <ChevronRight size={14} className="opacity-0 transition group-hover:opacity-60" />
    </NavLink>
  );
}
