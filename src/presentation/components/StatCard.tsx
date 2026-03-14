type StatCardProps = {
  label: string;
  value: React.ReactNode;
};

export const StatCard = ({label, value}: StatCardProps) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 transition-colors">
    <div className="text-sm font-medium text-[var(--color-text-muted)]">
      {label}
    </div>
    <div className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
      {value}
    </div>
  </div>
);
