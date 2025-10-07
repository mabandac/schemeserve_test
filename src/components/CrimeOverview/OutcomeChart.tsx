import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./OutcomeChart.module.scss";

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>Outcome Status</h3>
        <p className={styles.emptyText}>No outcome data available</p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>Outcome Status</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              angle={-15}
              textAnchor="end"
              height={60}
              fontSize={10}
              interval={0}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), "Crime(s)"]}
              labelStyle={{ color: "#374151" }}
            />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
