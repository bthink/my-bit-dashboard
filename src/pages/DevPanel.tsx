import {useState} from "react";
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
          <button
            type="button"
            onClick={clearError}
            className="shrink-0 rounded px-2 py-1 text-rose-700 transition-colors hover:bg-rose-200 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSaving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? "Saving…" : `Generate ${FAKE_ORDER_COUNT} orders`}
        </button>

        {!clearConfirm ? (
          <button
            type="button"
            onClick={handleClearClick}
            disabled={isSaving}
            className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 transition-colors hover:bg-rose-100 disabled:opacity-50 disabled:pointer-events-none"
          >
            Clear DB
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Remove all orders from store and localStorage?
            </span>
            <button
              type="button"
              onClick={handleClearClick}
              disabled={isSaving}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
            >
              Yes, clear all
            </button>
            <button
              type="button"
              onClick={handleClearCancel}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default DevPanelPage;
