"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlyStat } from "../type";

interface Props {
  data: MonthlyStat[];
}

export function MonthlyChart({ data }: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-gray-100">
      <p className="text-xs text-gray-500 mb-4">📈 월별 완독 기록</p>

      <div className="w-full h-56">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(124,152,133,0.08)" }}
            />

            <Bar
              dataKey="count"
              fill="#7C9885"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
