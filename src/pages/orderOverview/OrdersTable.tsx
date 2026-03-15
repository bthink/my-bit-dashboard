import {useRef} from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import {Eye, Pencil, Trash2} from "lucide-react";
import type {Order} from "../../domain/orders/order";
import {Button} from "../../presentation/components/Button";
import {SortableColumnHeader} from "../../presentation/components/SortableColumnHeader";
import type {SortKey, SortState} from "./useOrderOverviewController";

type OrdersTableProps = {
  orders: Order[];
  sort: SortState;
  isSaving: boolean;
  onSort: (key: SortKey) => void;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
};

const tableGridColumns =
  "grid-cols-[minmax(140px,1fr)_minmax(100px,1fr)_minmax(80px,1fr)_minmax(110px,1fr)_132px]";
const tableHeaderCellClass =
  "flex items-center gap-1 px-4 py-3 font-medium text-[var(--color-text-muted)]";

const formatPrice = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const OrdersTable = ({
  orders,
  sort,
  isSaving,
  onSort,
  onView,
  onEdit,
  onDelete,
}: OrdersTableProps) => {
  const scrollParentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual returns non-memoizable functions; React Compiler skips this component by design
  // eslint-disable-next-line react-hooks/incompatible-library -- useVirtualizer API limitation
  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--color-border)]"
      role="table"
      aria-label="Orders"
    >
      <div
        className={`grid ${tableGridColumns} shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-left text-sm`}
        role="row"
        style={{minWidth: 560}}
      >
        <div className={tableHeaderCellClass} role="columnheader">
          <SortableColumnHeader
            sortKey="destinationCountry"
            sort={sort}
            onSort={onSort}
          >
            Destination
          </SortableColumnHeader>
        </div>
        <div className={tableHeaderCellClass} role="columnheader">
          <SortableColumnHeader
            sortKey="shippingDate"
            sort={sort}
            onSort={onSort}
          >
            Shipping date
          </SortableColumnHeader>
        </div>
        <div className={tableHeaderCellClass} role="columnheader">
          <SortableColumnHeader sortKey="price" sort={sort} onSort={onSort}>
            Price
          </SortableColumnHeader>
        </div>
        <div className={tableHeaderCellClass} role="columnheader">
          <SortableColumnHeader sortKey="createdAt" sort={sort} onSort={onSort}>
            Created at
          </SortableColumnHeader>
        </div>
        <div
          className="flex items-center px-4 py-3 font-medium text-[var(--color-text-muted)]"
          role="columnheader"
        >
          Actions
        </div>
      </div>
      <div
        ref={scrollParentRef}
        className="themed-scrollbar min-h-0 flex-1 overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
            minWidth: 560,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const order = orders[virtualRow.index];
            return (
              <div
                key={order.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`grid ${tableGridColumns} border-b border-[var(--color-border)] text-left text-sm transition-colors hover:bg-[var(--color-surface-soft)]`}
                role="row"
              >
                <div
                  className="flex items-center px-4 py-3 text-[var(--color-text)]"
                  role="cell"
                >
                  {order.destinationCountry}
                </div>
                <div
                  className="flex items-center px-4 py-3 text-[var(--color-text)]"
                  role="cell"
                >
                  {order.shippingDate}
                </div>
                <div
                  className="flex items-center px-4 py-3 text-[var(--color-text)]"
                  role="cell"
                >
                  {formatPrice(order.price)}
                </div>
                <div
                  className="flex items-center px-4 py-3 text-[var(--color-text)]"
                  role="cell"
                >
                  {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center px-4 py-3" role="cell">
                  <span className="flex items-center gap-1">
                    <Button
                      size="icon"
                      onClick={() => onView(order)}
                      disabled={isSaving}
                      title="View"
                      aria-label={`View order ${order.id}`}
                    >
                      <Eye size={18} aria-hidden />
                    </Button>
                    <Button
                      variant="primaryOutline"
                      size="icon"
                      onClick={() => onEdit(order)}
                      disabled={isSaving}
                      title="Edit"
                      aria-label={`Edit order ${order.id}`}
                    >
                      <Pencil size={18} aria-hidden />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => onDelete(order.id)}
                      disabled={isSaving}
                      title="Delete"
                      aria-label={`Delete order ${order.id}`}
                    >
                      <Trash2 size={18} aria-hidden />
                    </Button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
