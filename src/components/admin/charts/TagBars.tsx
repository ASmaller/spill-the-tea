"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Item = {
  label: string;
  count: number;
  color?: string;
};

type Props = {
  items: Item[];
  defaultColor?: string;
};

export function TagBars({ items, defaultColor = "var(--color-tea)" }: Props) {
  if (items.length === 0) return null;

  const max = Math.max(...items.map(i => i.count), 1);
  const height = Math.max(items.length * 30, 30);
  const data = items.map(item => ({
    ...item,
    color: item.color ?? defaultColor,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 320, height }}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
          barCategoryGap={6}
        >
          <XAxis hide type="number" domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            width={110}
            tick={{
              fill: "var(--color-ink)",
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <Bar
            dataKey="count"
            radius={3}
            background={{ fill: "rgba(26,24,21,0.04)", radius: 3 }}
            isAnimationActive={false}
          >
            {data.map(row => (
              <Cell key={row.label} fill={row.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill="var(--color-ink-soft)"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
