import clsx from "clsx";
import {NavLink} from "react-router-dom";

type SidebarNavLinkProps = {
  to: string;
  label: string;
  badge?: string;
};

export const SidebarNavLink = ({to, label, badge}: SidebarNavLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        clsx(
          "flex items-center justify-between rounded-lg px-3 py-2 transition",
          isActive
            ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/40"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )
      }
    >
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {badge}
        </span>
      )}
    </NavLink>
  );
};
