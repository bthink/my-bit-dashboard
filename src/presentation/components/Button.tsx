import type {ButtonHTMLAttributes} from "react";

type ButtonVariant = "primary" | "primaryOutline" | "danger" | "dangerSolid";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "icon";
  children: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-emerald-600 hover:bg-emerald-500 disabled:hover:bg-emerald-600",
  primaryOutline:
    "text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 disabled:hover:bg-transparent disabled:hover:text-emerald-600",
  danger:
    "text-rose-600 hover:bg-rose-100 hover:text-rose-800 disabled:hover:bg-transparent disabled:hover:text-rose-600",
  dangerSolid:
    "text-white bg-rose-600 hover:bg-rose-500 disabled:hover:bg-rose-600",
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
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:hover:bg-transparent disabled:hover:text-slate-600";
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
