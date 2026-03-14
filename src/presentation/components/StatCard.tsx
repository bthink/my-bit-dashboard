type StatCardProps = {
  label: string;
  value: React.ReactNode;
};

export const StatCard = ({label, value}: StatCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors">
    <div className="text-sm font-medium text-slate-600">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
  </div>
);
