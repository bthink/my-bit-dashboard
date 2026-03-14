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
import {Select} from "../presentation/components/Select";
import {StatCard} from "../presentation/components/StatCard";
import {useOrdersStore} from "../presentation/hooks/useOrdersStore";
import {
  calculateOrderMetrics,
  getOrderCountByCountry,
  getOrderCountByDate,
} from "../domain/orders/metrics";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
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
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          Orders dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          High-level metrics and trends for the Acme Logistics order pipeline.
        </p>
      </header>

      {error && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-danger-ring)] bg-[var(--color-danger-soft)] p-4 text-sm text-[var(--color-danger-hover)]"
          role="alert"
        >
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

      {!isInitialized && isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-[var(--color-surface-muted)]"
              aria-hidden
            />
          ))}
        </div>
      )}

      {isInitialized && (
        <div className="content-fade-in space-y-6">
          <Select
            id="dashboard-country-filter"
            label="Filter by country"
            value={selectedCountry}
            onChange={setSelectedCountry}
            options={uniqueCountries}
            placeholder={{value: "all", label: "All countries"}}
          />

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
            <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 text-sm text-[var(--color-text-muted)]">
              {selectedCountry === "all"
                ? "No orders yet. Add orders from the Order Overview page or use the Dev Panel to generate sample data."
                : `No orders for ${selectedCountry}. Change the filter or add orders.`}
            </p>
          ) : (
            <div className="space-y-6">
              {chartDataByCountry.length > 0 && (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-surface)] p-4">
                  <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
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
                          stroke="var(--color-chart-grid)"
                        />
                        <XAxis
                          dataKey="country"
                          tick={{fill: "var(--color-chart-label)", fontSize: 12}}
                          stroke="var(--color-chart-axis)"
                        />
                        <YAxis
                          tick={{fill: "var(--color-chart-label)", fontSize: 12}}
                          stroke="var(--color-chart-axis)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-chart-tooltip-bg)",
                            border: "1px solid var(--color-chart-tooltip-border)",
                            borderRadius: "8px",
                            color: "var(--color-chart-tooltip-text)",
                          }}
                          labelStyle={{color: "var(--color-chart-tooltip-text)"}}
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
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-surface)] p-4">
                  <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
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
                          stroke="var(--color-chart-grid)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{fill: "var(--color-chart-label)", fontSize: 12}}
                          stroke="var(--color-chart-axis)"
                        />
                        <YAxis
                          tick={{fill: "var(--color-chart-label)", fontSize: 12}}
                          stroke="var(--color-chart-axis)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-chart-tooltip-bg)",
                            border: "1px solid var(--color-chart-tooltip-border)",
                            borderRadius: "8px",
                            color: "var(--color-chart-tooltip-text)",
                          }}
                          labelStyle={{color: "var(--color-chart-tooltip-text)"}}
                        />
                        <Bar
                          dataKey="count"
                          name="Orders"
                          fill="var(--color-chart-1)"
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
