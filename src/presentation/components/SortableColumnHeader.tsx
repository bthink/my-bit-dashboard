import type {ReactNode} from "react";

type SortDir = "asc" | "desc";

export type SortableColumnHeaderProps<T extends string> = {
  sortKey: T;
  sort: {key: T; dir: SortDir} | null | undefined;
  onSort: (key: T) => void;
  children: ReactNode;
};

export const SortableColumnHeader = <T extends string>({
  sortKey,
  sort,
  onSort,
  children,
}: SortableColumnHeaderProps<T>) => {
  const isActive = sort?.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 rounded p-0 text-left hover:bg-[var(--color-surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:ring-offset-1"
      aria-sort={
        isActive ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
      }
    >
      {children}
      {isActive && <span aria-hidden>{sort.dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
};
