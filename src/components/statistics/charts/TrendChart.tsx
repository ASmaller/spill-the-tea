"use client";

import type { TrendSeries } from "@/lib/types";
import type { TooltipValueType } from "recharts";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  series: TrendSeries[];
  xLabels?: string[];
  width?: number;
  height?: number;
  showXTicks?: boolean;
};

// `i` is the unique x value: recharts groups data points by the XAxis
// dataKey, so reusing a category (e.g. a blank label) collapses points
// onto each other and the hover cursor snaps to the first match.
type TrendDatum = {
  i: number;
  label: string;
} & Record<string, number | string | null>;

function toChartData(series: TrendSeries[], xLabels?: string[]): TrendDatum[] {
  const pointCount = Math.max(
    xLabels?.length ?? 0,
    ...series.map(s => s.data.length),
    0
  );

  return Array.from({ length: pointCount }, (_, index) => {
    const row: TrendDatum = {
      i: index,
      label: xLabels?.[index] ?? String(index + 1),
    };

    series.forEach(s => {
      row[s.name] = s.data[index] ?? null;
    });

    return row;
  });
}

function formatTooltipValue(value: TooltipValueType | undefined): string {
  if (value == null) return "";
  if (typeof value === "number") return value.toFixed(1);
  return String(value);
}

export function TrendChart({
  series,
  xLabels,
  width = 1000,
  height = 240,
  showXTicks = true,
}: Props) {
  const data = toChartData(series, xLabels);
  const labelByIndex = (i: number) => data[i]?.label ?? "";

  return (
    <div
      style={{
        width: "100%",
        height,
      }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width, height }}
      >
        <LineChart
          data={data}
          margin={{ top: 10, right: 12, bottom: 0, left: -10 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="rgba(26,24,21,0.06)"
            strokeDasharray="2 3"
          />
          <XAxis
            dataKey="i"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={
              showXTicks
                ? { fill: "var(--color-ink-soft)", fontSize: 11 }
                : false
            }
            tickFormatter={(value: number) => labelByIndex(value)}
            interval={0}
            minTickGap={6}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-ink-soft)", fontSize: 11 }}
            width={34}
          />
          <Tooltip
            cursor={{ stroke: "rgba(26,24,21,0.16)", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "var(--color-paper)",
              border: "1px solid rgba(26,24,21,0.10)",
              borderRadius: 8,
              color: "var(--color-ink)",
              fontSize: 12,
              boxShadow: "0 6px 18px rgba(26,24,21,0.10)",
            }}
            labelStyle={{
              color: "var(--color-ink-muted)",
              fontSize: 11,
              marginBottom: 4,
            }}
            labelFormatter={(value: unknown) =>
              typeof value === "number" ? labelByIndex(value) : ""
            }
            formatter={formatTooltipValue}
          />
          {series.map(s => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
