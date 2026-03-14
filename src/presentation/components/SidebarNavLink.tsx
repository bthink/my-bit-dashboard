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
            ? "bg-[linear-gradient(110deg,var(--color-accent-soft),var(--color-primary-soft))] text-[var(--color-text)] ring-1 ring-[var(--color-primary-ring)]"
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]",
        )
      }
    >
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-soft)]">
          {badge}
        </span>
      )}
    </NavLink>
  );
};
