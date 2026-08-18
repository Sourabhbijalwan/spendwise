"use client";

// Recharts measures the DOM, so it only runs in the browser. Server pages fetch and
// aggregate the data, then pass plain arrays in as props.
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/money";

const COLORS = ["#059669", "#2563eb", "#d97706", "#db2777", "#7c3aed", "#0891b2", "#64748b"];

const money = (value: unknown) => formatMoney(Number(value));

export function CategoryPie({ data }: { data: { category: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={d.category} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={money} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyBar({ data }: { data: { day: number; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={70}
          tickFormatter={(v: number) => formatMoney(v).replace(/\.00$/, "")}
        />
        <Tooltip formatter={money} labelFormatter={(day) => `Day ${day}`} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="total" name="Spent" fill="#059669" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
