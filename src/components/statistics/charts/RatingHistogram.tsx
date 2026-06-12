"use client";

import { DIST_COLORS } from "@/lib/admin/colors";
import { ratingTotal } from "@/lib/admin/ratings";
import {
  Bar,
  BarChart,
  BarShapeProps,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  dist: readonly number[];
};

export function RatingHistogram({ dist }: Props) {
  const total = ratingTotal(dist);
  const data = [5, 4, 3, 2, 1].map(rating => {
    const index = rating - 1;
    const count = dist[index] ?? 0;
    const sharePct = total === 0 ? 0 : (count / total) * 100;

    return {
      rating,
      count,
      sharePct,
      color: DIST_COLORS[index],
      summary: `${count} · ${sharePct.toFixed(0)}%`,
    };
  });

  return (
    <div style={{ width: "100%", height: 126 }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 320, height: 126 }}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 76, bottom: 0, left: 0 }}
          barCategoryGap={6}
        >
          <XAxis hide type="number" domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="rating"
            axisLine={false}
            tickLine={false}
            width={46}
            tick={{
              fill: "var(--color-ink-muted)",
              fontSize: 11,
            }}
          />
          <Bar
            dataKey="sharePct"
            radius={3}
            background={{ fill: "rgba(26,24,21,0.04)", radius: 3 }}
            isAnimationActive={false}
            shape={CustomBar}
          >
            <LabelList
              dataKey={props =>
                props.count ? props.summary : `${props.sharePct}%`
              }
              position="right"
              fill="var(--color-ink-soft)"
              fontSize={11}
              textBreakAll={true}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomBar(props: BarShapeProps) {
  return <Rectangle {...props} fill={props.color} />;
}
