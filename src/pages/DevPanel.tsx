import {useState} from "react";
import {Button} from "../presentation/components/Button";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {generateFakeOrders} from "../application/orders/fakeOrders";

const FAKE_ORDER_COUNT = 100;

const DevPanelPage = () => {
  const {replaceOrders, isSaving, error, clearError} = useOrdersStore();
  const [clearConfirm, setClearConfirm] = useState(false);

  if (import.meta.env.PROD) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Dev Panel is only meant to be used in development builds. The route is
        still present in production, but controls will remain disabled.
      </div>
    );
  }

  const handleGenerate = async () => {
    try {
      await replaceOrders(generateFakeOrders(FAKE_ORDER_COUNT));
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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Dev panel
        </h1>
        <p className="text-sm text-slate-600">
          Local tools for generating and clearing orders during development. In
          the future, this can be shown based on the environment variable.
        </p>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error}</span>
          <Button
            variant="danger"
            onClick={clearError}
            className="text-rose-700 hover:bg-rose-200 hover:text-rose-900"
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
          {isSaving ? "Saving…" : `Generate ${FAKE_ORDER_COUNT} orders`}
        </Button>

        {!clearConfirm ? (
          <Button
            variant="danger"
            size="md"
            onClick={handleClearClick}
            disabled={isSaving}
            className="border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
          >
            Clear DB
          </Button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
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
              className="border border-slate-300 text-slate-700 hover:bg-slate-200"
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
