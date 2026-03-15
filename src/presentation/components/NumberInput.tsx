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
  required?: boolean;
};

const baseClassName =
  "w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-soft)] transition-colors focus:outline-none focus:ring-1";
const errorClassName =
  "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]";
const defaultClassName =
  "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]";

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
  labelClassName = "mb-1 block text-sm font-medium text-[var(--color-text-muted)]",
  required = false,
}: NumberInputProps) => {
  const hasError = Boolean(error);
  const errorId = `${id}-error`;

  return (
    <div className={wrapperClassName || undefined}>
      <label htmlFor={id} className={labelClassName}>
        {label}
        {required && (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${baseClassName} ${hasError ? errorClassName : defaultClassName}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
