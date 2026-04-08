"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatRupees, expenseCategoryLabel } from "@/lib/utils/format";

interface CategoryData {
  category: string;
  totalPaise: number;
}

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

export function RechartsCategoryChart({ data }: { data: CategoryData[] }) {
  const chartData = data.map((d) => ({
    name: expenseCategoryLabel(d.category),
    value: d.totalPaise,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(props: { name?: string; percent?: number }) =>
            `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: unknown) => formatRupees(Number(v))} />
      </PieChart>
    </ResponsiveContainer>
  );
}
