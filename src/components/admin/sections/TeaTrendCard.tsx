"use client";

import { TrendChart } from "@/components/admin/charts/TrendChart";
import { SectionHead } from "@/components/admin/SectionHead";
import { Card } from "@/components/ui/Card";
import { FOCUS_RING } from "@/lib/styles";
import type { AdminMealTrend } from "@/services/statisticsService";
import { useState } from "react";

type RangeKey = "10" | "30" | "100";

const RANGE_KEYS: RangeKey[] = ["10", "30", "100"];

type Props = {
  teaId: number;
  initialTrend: AdminMealTrend;
};

export function TeaTrendCard({ teaId, initialTrend }: Props) {
  const [range, setRange] = useState<RangeKey>("30");
  const [trend, setTrend] = useState(initialTrend);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectRange = async (nextRange: RangeKey) => {
    if (nextRange === range || isLoading) return;

    setRange(nextRange);
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(
        `/api/admin/teas/${teaId}/analytics?servings=${nextRange}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Failed to load meal trend");

      setTrend((await response.json()) as AdminMealTrend);
    } catch (error) {
      console.error("Failed to load meal trend", error);
      setLoadError("Could not load this range.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <SectionHead
        title="Rating over time"
        sub={`Last ${range} servings · most recent right`}
        right={
          <div
            className="text-ink-soft text-meta flex items-center font-medium"
            style={{ gap: 6 }}
          >
            <span>Servings</span>
            <div
              className="bg-paper border-ink/[0.10] flex overflow-hidden border"
              style={{ borderRadius: 7 }}
            >
              {RANGE_KEYS.map((t, i) => (
                <RangeItem
                  key={t}
                  label={t}
                  active={range === t}
                  onClick={() => selectRange(t)}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </div>
        }
      />
      <div className="relative">
        <div
          style={{
            opacity: isLoading ? 0.5 : 1,
            transition: "opacity 120ms ease-out",
          }}
        >
          {trend.xLabels.length > 0 ? (
            <TrendChart
              width={560}
              height={200}
              xLabels={trend.xLabels}
              series={trend.series}
              showXTicks={false}
            />
          ) : (
            <div
              className="text-ink-soft text-meta flex items-center justify-center"
              style={{ height: 200 }}
            >
              No rated servings yet.
            </div>
          )}
        </div>
        {isLoading && (
          <div
            className="text-ink-soft text-meta absolute inset-0 flex items-center justify-center"
            aria-live="polite"
          >
            Loading…
          </div>
        )}
      </div>
      {loadError && (
        <div className="text-rose text-meta" style={{ marginTop: 8 }}>
          {loadError}
        </div>
      )}
    </Card>
  );
}

function RangeItem({
  label,
  active,
  onClick,
  isFirst,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  isFirst?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-meta font-medium ${
        active ? "bg-ink text-paper" : "text-ink"
      } ${FOCUS_RING.cream}`}
      style={{
        padding: "6px 11px",
        cursor: "pointer",
        borderLeft: isFirst ? "none" : "1px solid rgba(26,24,21,0.10)",
      }}
    >
      {label}
    </button>
  );
}
