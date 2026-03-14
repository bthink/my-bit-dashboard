import {Navigate, Route, Routes} from "react-router-dom";
import {SidebarNavLink} from "./presentation/components/SidebarNavLink";
import Dashboard from "./pages/Dashboard";
import OrderOverview from "./pages/OrderOverview";
import DevPanel from "./pages/DevPanel";

const App = () => {
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 backdrop-blur lg:w-64">
          <div className="mb-6">
            <div className="text-sm font-semibold tracking-tight text-slate-900">
              Acme Logistics{" "}
              <span className="text-slate-500 font-normal">by</span>{" "}
              Dawn.Technology
            </div>
          </div>

          <nav className="space-y-1 text-sm">
            <SidebarNavLink to="/dashboard" label="Dashboard" badge="Summary" />
            <SidebarNavLink
              to="/orders"
              label="Order Overview"
              badge="Inventory"
            />
            {!import.meta.env.PROD && (
              <SidebarNavLink to="/dev" label="Dev Panel" badge="Dev only" />
            )}
          </nav>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 backdrop-blur md:p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<OrderOverview />} />
              {!import.meta.env.PROD && (
                <Route path="/dev" element={<DevPanel />} />
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
