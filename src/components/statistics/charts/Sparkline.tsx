"use client";

import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: string;
};

export function Sparkline({
  data,
  color = "var(--color-tea)",
  width = 64,
  height = 32,
  fill,
}: Props) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const domain: [number, number] =
    min === max ? [min - 1, max + 1] : [min, max];
  const points = data.map((value, index) => ({ index, value }));
  const last = points[points.length - 1];

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width, height }}
      >
        <AreaChart
          data={points}
          margin={{ top: 2, right: 3, bottom: 2, left: 3 }}
        >
          <XAxis
            hide
            dataKey="index"
            type="number"
            domain={[0, Math.max(data.length - 1, 1)]}
          />
          <YAxis hide domain={domain} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={fill ?? color}
            fillOpacity={fill ? 0.3 : 0}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={last.index}
            y={last.value}
            r={2.5}
            fill={color}
            stroke="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
