import React from "react";

type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<SelectOption | string>;
  id?: string;
  label?: string;
  placeholder?: SelectOption;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  error?: string | null;
};

const defaultSelectClassName =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

const errorSelectSuffix =
  "border-rose-500 focus:border-rose-500 focus:ring-rose-500";

const normalizeOption = (opt: SelectOption | string): SelectOption =>
  typeof opt === "string" ? { value: opt, label: opt } : opt;

export const Select = ({
  value,
  onChange,
  options,
  id: idProp,
  label,
  placeholder,
  className = defaultSelectClassName,
  wrapperClassName = "flex flex-wrap items-center gap-4",
  labelClassName = "text-sm text-slate-600",
  error = null,
}: SelectProps) => {
  const generatedId = React.useId();
  const errorId = React.useId();
  const normalizedOptions = options.map(normalizeOption);
  const selectId = idProp ?? generatedId;
  const hasError = Boolean(error);
  const effectiveClassName = hasError
    ? `${className} ${errorSelectSuffix}`.trim()
    : className;

  return (
    <div className={wrapperClassName}>
      {label != null && (
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={effectiveClassName}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      >
        {placeholder != null && (
          <option value={placeholder.value}>{placeholder.label}</option>
        )}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && error != null && (
        <p id={errorId} className="mt-1 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
