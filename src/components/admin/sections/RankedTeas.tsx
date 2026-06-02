"use client";

import { SectionHead } from "@/components/admin/SectionHead";
import { SelectFilter } from "@/components/admin/SelectFilter";
import { LINE_COLOR, MEAL_LINES, ratingColor } from "@/lib/admin/colors";
import { relativeDays } from "@/lib/admin/relative-time";
import type { MealStat } from "@/lib/admin/types";
import { FOCUS_RING } from "@/lib/styles";
import type { MealLine } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = { teas: MealStat[] };

type LineKey = "all" | MealLine;
type RangeKey = "7d" | "30d";
type SortKey = "top" | "bottom" | "votes" | "latest";

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSinceDate(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return Math.round((today.getTime() - parsed.getTime()) / DAY_MS);
}

function mealRecencyDays(meal: MealStat): number | null {
  return daysSinceDate(meal.lastServedAt) ?? relativeDays(meal.lastServed);
}

function mealServedTime(meal: MealStat): number {
  return meal.lastServedAt ? new Date(meal.lastServedAt).getTime() : 0;
}

const SORT_COMPARE: Record<SortKey, (a: MealStat, b: MealStat) => number> = {
  top: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  bottom: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
  votes: (a, b) => b.votes - a.votes,
  latest: (a, b) => mealServedTime(b) - mealServedTime(a),
};

const RANGE_KEYS = Object.keys(RANGE_DAYS) as RangeKey[];

export function RankedTeas({ teas }: Props) {
  const [line, setLine] = useState<LineKey>("all");
  const [range, setRange] = useState<RangeKey>("30d");
  const [sort, setSort] = useState<SortKey>("top");
  const [showAll, setShowAll] = useState(false);

  const totalVotes = useMemo(
    () => teas.reduce((acc, tea) => acc + tea.votes, 0),
    [teas]
  );

  const filtered = useMemo(() => {
    const maxDays = RANGE_DAYS[range];
    return teas
      .filter(tea => {
        if (tea.rating == null) return false;
        if (line !== "all" && tea.line !== line) return false;
        const days = mealRecencyDays(tea);
        return days != null && days <= maxDays;
      })
      .sort(SORT_COMPARE[sort]);
  }, [teas, line, range, sort]);

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
        <div
          className="bg-paper border-ink/[0.10] flex overflow-hidden border"
          style={{ borderRadius: 7 }}
        >
          <SegmentedItem
            label="All lines"
            active={line === "all"}
            onClick={() => setLine("all")}
            isFirst
          />
          {MEAL_LINES.map(l => (
            <SegmentedItem
              key={l}
              label={l}
              dot={LINE_COLOR[l]}
              active={line === l}
              onClick={() => setLine(l)}
            />
          ))}
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="text-ink-soft text-meta flex items-center font-medium"
            style={{ gap: 6 }}
          >
            <span>Last</span>
            <div
              className="bg-paper border-ink/[0.10] flex overflow-hidden border"
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
            <option value="latest">Latest served</option>
          </SelectFilter>
        </div>
      </div>

      <div
        className="text-ink-soft text-eyebrow grid uppercase"
        style={{
          gridTemplateColumns: "3px 220px 1fr 90px 60px 80px",
          gap: 14,
          padding: "0 0 8px 0",
        }}
      >
        <div />
        <div>Tea · line</div>
        <div>Rating</div>
        <div style={{ textAlign: "right" }}>Last served</div>
        <div style={{ textAlign: "right" }}>Avg</div>
        <div style={{ textAlign: "right" }}>Votes</div>
      </div>

      {visible.map(teas => {
        const r = teas.rating ?? 0;
        const tone = ratingColor(r);
        return (
          <Link
            key={teas.id}
            href={`/admin/teas/${teas.id}`}
            className={`hover:bg-ink/[0.03] grid items-center transition-colors ${FOCUS_RING.paper}`}
            style={{
              gridTemplateColumns: "3px 220px 1fr 90px 60px 80px",
              gap: 14,
              marginBottom: 6,
              padding: "6px 0",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 3,
                height: 32,
                background: LINE_COLOR[teas.line],
                borderRadius: 2,
              }}
            />
            <div className="min-w-0">
              <div
                className="text-ink text-body truncate font-medium"
                style={{ lineHeight: 1.2 }}
              >
                {teas.name}
              </div>
              <div
                className="text-ink-soft text-caption uppercase"
                style={{ marginTop: 2 }}
              >
                {teas.line}
              </div>
            </div>
            <div
              className="bg-ink/[0.04] relative overflow-hidden"
              style={{ height: 22, borderRadius: 4 }}
            >
              <div
                className="h-full"
                style={{
                  width: `${(r / 5) * 100}%`,
                  background: tone,
                  borderRadius: 4,
                }}
              />
            </div>
            <div className="text-ink-soft text-meta text-right tabular-nums">
              {teas.lastServed}
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
        <div
          className="text-ink-soft text-meta text-center"
          style={{ padding: "24px 0" }}
        >
          {teas.length === 0
            ? "No teas available."
            : "No teas match those filters."}
        </div>
      ) : filtered.length > 6 ? (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={`text-tea text-meta border-ink/[0.06] block w-full border-t font-medium ${FOCUS_RING.paper}`}
          style={{
            marginTop: 10,
            padding: "10px 0",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          {showAll ? "Show fewer ↑" : `Show all ${filtered.length} teas ↓`}
        </button>
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
