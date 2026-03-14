type NumberInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  min?: number;
  step?: number | "any";
  placeholder?: string;
  wrapperClassName?: string;
  labelClassName?: string;
};

const baseClassName =
  "w-full rounded-lg border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1";
const errorClassName =
  "border-rose-500 focus:border-rose-500 focus:ring-rose-500";
const defaultClassName =
  "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500";

export const NumberInput = ({
  id,
  label,
  value,
  onChange,
  error = null,
  min,
  step = "any",
  placeholder,
  wrapperClassName = "",
  labelClassName = "mb-1 block text-sm font-medium text-slate-600",
}: NumberInputProps) => {
  const hasError = Boolean(error);
  const errorId = `${id}-error`;

  return (
    <div className={wrapperClassName || undefined}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseClassName} ${hasError ? errorClassName : defaultClassName}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
