import { Card } from "@/components/layout/Card";
import { Pill } from "@/components/primitives/Pill";
import { ratingColor } from "@/lib/admin/colors";
import { FOCUS_RING } from "@/lib/styles";
import type { TeaStat } from "@/lib/types";
import Link from "next/link";

type Props = { teas: TeaStat[]; urlPrefix: string };

const COLS = "2.6fr 2fr 0.8fr 0.8fr 0.9fr 32px";

export function TeaTable({ teas, urlPrefix }: Props) {
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
      </div>
      {teas.map((tea, i) => {
        return (
          <Link
            key={tea.id}
            href={urlPrefix + tea.id}
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
            </div>
            <div
              className="flex min-w-0 flex-wrap items-center"
              style={{ gap: 4 }}
            >
              {tea.tags.map(t => (
                <Pill key={t.id} tone="neutral">
                  {t.name}
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
            <div className="text-ink-soft text-right">›</div>
          </Link>
        );
      })}
    </Card>
  );
}
