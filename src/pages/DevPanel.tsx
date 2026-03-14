import {useState} from "react";
import {Button} from "../presentation/components/Button";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {generateFakeOrders} from "../application/orders/fakeOrders";

const FAKE_ORDER_COUNT = 100;

const DevPanelPage = () => {
  const {orders, replaceOrders, isSaving, error, clearError} = useOrdersStore();
  const [clearConfirm, setClearConfirm] = useState(false);

  if (import.meta.env.PROD) {
    return (
      <div className="rounded-lg border border-[var(--color-primary-ring)] bg-[var(--color-surface-soft)] p-4 text-sm text-[var(--color-text)]">
        Dev Panel is only meant to be used in development builds. The route is
        still present in production, but controls will remain disabled.
      </div>
    );
  }

  const handleGenerate = async () => {
    try {
      const newOrders = generateFakeOrders(FAKE_ORDER_COUNT);
      await replaceOrders([...orders, ...newOrders]);
    } catch {
      // Error surfaced via store
    }
  };

  const handleClearClick = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    setClearConfirm(false);
    replaceOrders([]).catch(() => {});
  };

  const handleClearCancel = () => setClearConfirm(false);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          Dev panel
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Local tools for generating and clearing orders during development. In
          the future, this can be shown based on the environment variable.
        </p>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-danger-ring)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger-hover)]">
          <span>{error}</span>
          <Button
            variant="danger"
            onClick={clearError}
            className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger-hover)]"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleGenerate}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : `Add ${FAKE_ORDER_COUNT} orders`}
        </Button>

        {!clearConfirm ? (
          <Button
            variant="danger"
            size="md"
            onClick={handleClearClick}
            disabled={isSaving}
            className="border border-[var(--color-danger-ring)] bg-[var(--color-danger-soft)] text-[var(--color-danger-hover)] hover:bg-[var(--color-danger-soft)]"
          >
            Clear DB
          </Button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">
              Remove all orders from store and localStorage?
            </span>
            <Button
              variant="dangerSolid"
              size="md"
              onClick={handleClearClick}
              disabled={isSaving}
              className="px-3 py-1.5"
            >
              Yes, clear all
            </Button>
            <Button
              size="md"
              onClick={handleClearCancel}
              disabled={isSaving}
              className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
            >
              Cancel
            </Button>
          </span>
        )}
      </div>
    </div>
  );
};

export default DevPanelPage;
