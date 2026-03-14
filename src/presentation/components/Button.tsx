import type {ButtonHTMLAttributes} from "react";

type ButtonVariant = "primary" | "primaryOutline" | "danger" | "dangerSolid";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "icon";
  children: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--brand-blue),var(--brand-magenta))] text-white shadow-sm shadow-[var(--color-primary-soft)] hover:bg-[linear-gradient(135deg,var(--brand-navy),var(--brand-magenta))] disabled:hover:bg-[linear-gradient(135deg,var(--brand-blue),var(--brand-magenta))]",
  primaryOutline:
    "border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-text)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-text)]",
  danger:
    "text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger-hover)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-danger)]",
  dangerSolid:
    "bg-[linear-gradient(135deg,var(--brand-coral),var(--brand-magenta))] text-white shadow-sm shadow-[var(--color-danger-soft)] hover:bg-[linear-gradient(135deg,var(--brand-magenta),var(--brand-coral))] disabled:hover:bg-[linear-gradient(135deg,var(--brand-coral),var(--brand-magenta))]",
};

const sizeClasses = {
  sm: "rounded px-2 py-1 text-sm font-medium",
  md: "rounded-lg px-4 py-2 text-sm font-medium",
  icon: "rounded p-1 min-w-[2.25rem] min-h-[2.25rem] inline-flex items-center justify-center text-xl leading-none",
};

export const Button = ({
  variant,
  size = "sm",
  className = "",
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) => {
  const base =
    "shrink-0 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClass = variant
    ? variantClasses[variant]
    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-muted)]";
  const sizeClass = sizeClasses[size];

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
};
