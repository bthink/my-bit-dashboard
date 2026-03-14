import {useMemo, useState} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {Button} from "../presentation/components/Button";
import {ChartContainer} from "../presentation/components/ChartContainer";
import {StatCard} from "../presentation/components/StatCard";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {
  calculateOrderMetrics,
  getOrderCountByCountry,
  getOrderCountByDate,
} from "../domain/orders/metrics";

const CHART_COLORS = [
  "rgb(16 185 129)",
  "rgb(52 211 153)",
  "rgb(110 231 183)",
  "rgb(167 243 208)",
  "rgb(45 212 191)",
  "rgb(94 234 212)",
];

const Dashboard = () => {
  const {orders, isInitialized, isLoading, error, clearError} =
    useOrdersStore();
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const uniqueCountries = useMemo(() => {
    const set = new Set(orders.map((o) => o.destinationCountry));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedCountry === "all") return orders;
    return orders.filter((o) => o.destinationCountry === selectedCountry);
  }, [orders, selectedCountry]);

  const metrics = useMemo(
    () => calculateOrderMetrics(filteredOrders),
    [filteredOrders],
  );

  const chartDataByCountry = useMemo(
    () => getOrderCountByCountry(filteredOrders),
    [filteredOrders],
  );

  const chartDataByDate = useMemo(
    () => getOrderCountByDate(filteredOrders),
    [filteredOrders],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Orders dashboard
        </h1>
        <p className="text-sm text-slate-600">
          High-level metrics and trends for the Acme Logistics order pipeline.
        </p>
      </header>

      {error && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800"
          role="alert"
        >
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

      {!isInitialized && isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-slate-200"
              aria-hidden
            />
          ))}
        </div>
      )}

      {isInitialized && (
        <div className="content-fade-in space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <label
              htmlFor="dashboard-country-filter"
              className="text-sm text-slate-600"
            >
              Filter by country
            </label>
            <select
              id="dashboard-country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All countries</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total orders" value={metrics.totalOrders} />
            <StatCard
              label="Total price"
              value={metrics.totalPrice.toLocaleString()}
            />
            <StatCard
              label="Unique countries"
              value={metrics.uniqueCountries}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">
              {selectedCountry === "all"
                ? "No orders yet. Add orders from the Order Overview page or use the Dev Panel to generate sample data."
                : `No orders for ${selectedCountry}. Change the filter or add orders.`}
            </p>
          ) : (
            <div className="space-y-6">
              {chartDataByCountry.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h2 className="mb-4 text-sm font-medium text-slate-600">
                    Orders by country
                  </h2>
                  <ChartContainer>
                    {({width, height}) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={chartDataByCountry}
                        margin={{top: 8, right: 8, left: 8, bottom: 8}}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgb(226 232 240)"
                        />
                        <XAxis
                          dataKey="country"
                          tick={{fill: "rgb(71 85 105)", fontSize: 12}}
                          stroke="rgb(203 213 225)"
                        />
                        <YAxis
                          tick={{fill: "rgb(71 85 105)", fontSize: 12}}
                          stroke="rgb(203 213 225)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(255 255 255)",
                            border: "1px solid rgb(226 232 240)",
                            borderRadius: "8px",
                            color: "rgb(15 23 42)",
                          }}
                          labelStyle={{color: "rgb(51 65 85)"}}
                        />
                        <Bar
                          dataKey="count"
                          name="Orders"
                          radius={[4, 4, 0, 0]}
                        >
                          {chartDataByCountry.map((row, i) => (
                            <Cell
                              key={row.country}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ChartContainer>
                </div>
              )}

              {chartDataByDate.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h2 className="mb-4 text-sm font-medium text-slate-600">
                    Orders by shipping date
                  </h2>
                  <ChartContainer>
                    {({width, height}) => (
                      <BarChart
                        width={width}
                        height={height}
                        data={chartDataByDate}
                        margin={{top: 8, right: 8, left: 8, bottom: 8}}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgb(226 232 240)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{fill: "rgb(71 85 105)", fontSize: 12}}
                          stroke="rgb(203 213 225)"
                        />
                        <YAxis
                          tick={{fill: "rgb(71 85 105)", fontSize: 12}}
                          stroke="rgb(203 213 225)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(255 255 255)",
                            border: "1px solid rgb(226 232 240)",
                            borderRadius: "8px",
                            color: "rgb(15 23 42)",
                          }}
                          labelStyle={{color: "rgb(51 65 85)"}}
                        />
                        <Bar
                          dataKey="count"
                          name="Orders"
                          fill="rgb(16 185 129)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ChartContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
