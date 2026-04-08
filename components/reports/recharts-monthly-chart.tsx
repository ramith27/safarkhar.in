"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupees } from "@/lib/utils/format";

interface MonthlyData {
  month: string;
  totalPaise: number;
}

export function RechartsMonthlyChart({ data }: { data: MonthlyData[] }) {
  const chartData = data.map((d) => ({
    month: d.month,
    amount: d.totalPaise / 100, // paise → rupees for display
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          className="fill-muted-foreground"
        />
        <Tooltip
          formatter={(v: unknown) => [formatRupees(Number(v) * 100), "Spent"]}
          labelClassName="font-medium"
        />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
