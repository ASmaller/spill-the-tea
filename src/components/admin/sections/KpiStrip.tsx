import { Sparkline } from "@/components/admin/charts/Sparkline";
import { Pill } from "@/components/admin/Pill";
import { Card } from "@/components/ui/Card";
import type { Kpi } from "@/lib/types";

type Props = { kpis: Kpi[] };

function trendTone(trend: string): "good" | "warn" | "neutral" {
  if (trend.startsWith("↑")) return "good";
  if (trend.startsWith("↓")) return "warn";
  return "neutral";
}

export function KpiStrip({ kpis }: Props) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 16,
      }}
    >
      {kpis.map(k => (
        <Card key={k.label} padding={18}>
          <div className="text-ink-soft text-eyebrow-lg uppercase">
            {k.label}
          </div>
          <div
            className="flex items-end justify-between"
            style={{ gap: 14, marginTop: 6 }}
          >
            <div
              className="text-ink text-kpi font-serif"
              style={{ lineHeight: 1 }}
            >
              {k.value}
            </div>
            <Sparkline
              data={k.spark}
              color={k.color}
              fill={k.color}
              width={64}
              height={32}
            />
          </div>
          <div
            className="text-meta flex flex-nowrap items-center"
            style={{ gap: 6, marginTop: 10 }}
          >
            <Pill tone={trendTone(k.trend)}>{k.trend}</Pill>
            <span className="text-ink-muted truncate">{k.sub}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
