"use client";

import { DIST_COLORS } from "@/lib/admin/colors";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  dist: readonly number[];
  width?: number;
  height?: number;
};

export function DistSpark({ dist, width = 52, height = 16 }: Props) {
  const max = Math.max(...dist, 1);
  const data = dist.map((value, index) => ({
    index,
    value,
    color: DIST_COLORS[index],
  }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width, height }}
      >
        <BarChart
          data={data}
          margin={{ top: 1, right: 0, bottom: 1, left: 0 }}
          barGap={1}
        >
          <XAxis hide dataKey="index" />
          <YAxis hide domain={[0, max]} />
          <Bar
            dataKey="value"
            radius={[0.5, 0.5, 0, 0]}
            isAnimationActive={false}
          >
            {data.map(row => (
              <Cell
                key={row.index}
                fill={row.color}
                opacity={row.value === 0 ? 0.15 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
