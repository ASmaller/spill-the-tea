import { Pill } from "@/components/admin/Pill";
import { Card } from "@/components/ui/Card";
import { ratingColor } from "@/lib/admin/colors";
import { NEW_TAG } from "@/lib/admin/types";
import type { MealStat } from "@/lib/admin/types";
import { FOCUS_RING } from "@/lib/styles";
import Link from "next/link";

type Props = { teas: MealStat[] };

const COLS = "2.6fr 2fr 0.8fr 0.8fr 0.9fr 32px";

export function TeaTable({ teas }: Props) {
  return (
    <Card padding={0}>
      <div
        className="text-ink-soft text-eyebrow border-ink/[0.06] grid border-b uppercase"
        style={{ gridTemplateColumns: COLS, padding: "10px 16px" }}
      >
        <div>Tea</div>
        <div>Tags</div>
        <div style={{ textAlign: "right" }}>Rating</div>
        <div style={{ textAlign: "right" }}>Votes</div>
        <div style={{ textAlign: "right" }}>CO₂e</div>
        <div />
      </div>
      {teas.map((tea, i) => {
        const visibleTags = tea.tags.filter(t => t !== NEW_TAG).slice(0, 3);
        return (
          <Link
            key={tea.id}
            href={`/admin/teas/${tea.id}`}
            className={`hover:bg-ink/[0.03] text-body grid items-center transition-colors ${FOCUS_RING.paper}`}
            style={{
              gridTemplateColumns: COLS,
              padding: "10px 16px",
              borderTop: i === 0 ? "none" : "1px solid rgba(26,24,21,0.04)",
              cursor: "pointer",
            }}
          >
            <div className="min-w-0">
              <div
                className="text-ink truncate font-medium"
                style={{ lineHeight: 1.2 }}
              >
                {tea.name}
              </div>
              <div
                className="text-ink-soft text-caption uppercase"
                style={{ marginTop: 2 }}
              >
                {tea.line}
              </div>
            </div>
            <div
              className="flex min-w-0 flex-wrap items-center"
              style={{ gap: 4 }}
            >
              {visibleTags.map(t => (
                <Pill key={t} tone="neutral">
                  {t}
                </Pill>
              ))}
            </div>
            <div className="flex items-center justify-end" style={{ gap: 8 }}>
              {tea.rating != null ? (
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: ratingColor(tea.rating) }}
                >
                  {tea.rating.toFixed(1)}
                </span>
              ) : (
                <span className="text-ink-soft">—</span>
              )}
            </div>
            <div className="text-ink-muted text-right tabular-nums">
              {tea.votes || "—"}
            </div>
            <div className="text-ink-muted text-right tabular-nums">
              {tea.co2 != null ? `${tea.co2} kg` : "—"}
            </div>
            <div className="text-ink-soft text-right">›</div>
          </Link>
        );
      })}
    </Card>
  );
}
