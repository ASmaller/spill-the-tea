"use client";

import { SectionHead } from "@/components/layout/SectionHead";
import { SelectFilter } from "@/components/search/SelectFilter";
import { ratingColor } from "@/lib/color";
import { FOCUS_RING } from "@/lib/styles";
import type { TeaStat } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = { teas: TeaStat[] };

type RangeKey = "7d" | "30d";
type SortKey = "top" | "bottom" | "votes";

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
};

const SORT_COMPARE: Record<SortKey, (a: TeaStat, b: TeaStat) => number> = {
  top: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  bottom: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
  votes: (a, b) => b.votes - a.votes,
};

const RANGE_KEYS = Object.keys(RANGE_DAYS) as RangeKey[];

export function RankedTeas({ teas }: Props) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [sort, setSort] = useState<SortKey>("top");
  const [showAll, setShowAll] = useState(false);

  const totalVotes = useMemo(
    () => teas.reduce((acc, tea) => acc + tea.votes, 0),
    [teas]
  );

  const filtered = useMemo(() => {
    return teas.filter(tea => tea.rating != null).sort(SORT_COMPARE[sort]);
  }, [teas, sort]);

  const visible = showAll ? filtered : filtered.slice(0, 6);

  return (
    <>
      <SectionHead
        title="Teas · ranked"
        sub={`${filtered.length} of ${teas.length} teas · ${totalVotes.toLocaleString()} ratings`}
      />

      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: 10, marginTop: 4, marginBottom: 14 }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="text-ink-soft text-meta flex items-center font-medium"
            style={{ gap: 6 }}
          >
            <span>Last</span>
            <div
              className="bg-paper border-ink/10 flex overflow-hidden border"
              style={{ borderRadius: 7 }}
            >
              {RANGE_KEYS.map((t, i) => (
                <SegmentedItem
                  key={t}
                  label={t}
                  active={range === t}
                  onClick={() => setRange(t)}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </div>
          <SelectFilter label="Sort" value={sort} onChange={setSort}>
            <option value="top">Highest rated</option>
            <option value="bottom">Lowest rated</option>
            <option value="votes">Most votes</option>
          </SelectFilter>
        </div>
      </div>

      <div
        className="text-ink-soft text-eyebrow grid gap-4 pb-2 uppercase"
        style={{
          gridTemplateColumns: "3px 220px 1fr 90px 60px 80px",
        }}
      >
        <div />
        <div>Tea · line</div>
        <div>Rating</div>
        <div style={{ textAlign: "right" }}>Avg</div>
        <div style={{ textAlign: "right" }}>Votes</div>
      </div>

      {visible.map(teas => {
        const r = teas.rating ?? 0;
        const tone = ratingColor(r);
        return (
          <Link
            key={teas.id}
            href={`/tea/${teas.id}`}
            className={`hover:bg-ink/3 mb-2 grid items-center gap-4 rounded-md py-1.5 transition-colors ${FOCUS_RING.paper}`}
            style={{
              gridTemplateColumns: "3px 220px 1fr 90px 60px 80px",
            }}
          >
            <div className="bg-tea-light h-6 w-1 rounded-full" />
            <div className="min-w-0">
              <div className="text-ink text-body truncate font-medium">
                {teas.name}
              </div>
            </div>
            <div className="bg-ink/4 relative h-5 overflow-hidden rounded">
              <div
                className="h-full rounded"
                style={{
                  width: `${(r / 5) * 100}%`,
                  background: tone,
                }}
              />
            </div>
            <div
              className="text-body text-right font-semibold tabular-nums"
              style={{ color: tone }}
            >
              {r.toFixed(1)}
            </div>
            <div className="text-ink-soft text-meta text-right tabular-nums">
              {teas.votes} votes
            </div>
          </Link>
        );
      })}

      {filtered.length === 0 ? (
        <div className="text-ink-soft text-meta py-5 text-center">
          {teas.length === 0
            ? "No teas available."
            : "No teas match those filters."}
        </div>
      ) : filtered.length > 6 ? (
        <div className="border-ink/6 mt-2 block flex w-full justify-center border-t">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className={`hover:bg-ink/3 text-tea text-meta mt-3 rounded-md px-3 py-2 font-medium ${FOCUS_RING.paper}`}
            style={{
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {showAll ? "Show fewer ↑" : `Show all ${filtered.length} teas ↓`}
          </button>
        </div>
      ) : null}
    </>
  );
}

function SegmentedItem({
  label,
  dot,
  active,
  onClick,
  isFirst,
}: {
  label: string;
  dot?: string;
  active: boolean;
  onClick: () => void;
  isFirst?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-meta flex items-center font-medium ${
        active ? "bg-ink text-paper" : "text-ink"
      } ${FOCUS_RING.cream}`}
      style={{
        padding: "6px 11px",
        cursor: "pointer",
        gap: 6,
        borderLeft: isFirst ? "none" : "1px solid rgba(26,24,21,0.10)",
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 6,
            background: dot,
            opacity: active ? 0.9 : 1,
          }}
        />
      )}
      {label}
    </button>
  );
}
