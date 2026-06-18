"use client";

import { Card } from "@/components/layout/Card";
import { Chip } from "@/components/primitives/Chip";
import { FilterRow } from "@/components/search/FilterRow";
import { SearchBar } from "@/components/search/SearchBar";
import { SelectFilter } from "@/components/search/SelectFilter";
import { FOCUS_RING } from "@/lib/styles";
import { TAG_OPTIONS, TeaStat } from "@/lib/types";
import { useMemo, useState } from "react";
import { TeaCard } from "./TeaCard";
import { TeaTable } from "./TeaTable";

type Props = {
  onClick?: (id: string) => void;
  teas: TeaStat[];
  ratedIds?: Set<string>;
  urlPrefix: string;
};

type SortKey = "rating" | "rating-asc" | "votes" | "name";
type ViewKey = "grid" | "table";

const TAG_KEYS = ["all", ...TAG_OPTIONS] as const;
type TagKey = (typeof TAG_KEYS)[number];

const STATUS_KEYS = ["all", "untried", "tried"] as const;
type StatusKey = (typeof STATUS_KEYS)[number];

const STATUS_LABELS: Record<StatusKey, string> = {
  all: "All",
  untried: "Untried",
  tried: "Tried",
};

const SORT_COMPARE: Record<SortKey, (a: TeaStat, b: TeaStat) => number> = {
  rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
  "rating-asc": (a, b) => (a.rating ?? Infinity) - (b.rating ?? Infinity),
  votes: (a, b) => b.votes - a.votes,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function TeaBrowser({ onClick, teas, ratedIds, urlPrefix }: Props) {
  const [view, setView] = useState<ViewKey>("grid");
  const [tag, setTag] = useState<TagKey>("all");
  const [status, setStatus] = useState<StatusKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const filtered = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return teas
      .filter(tea => {
        if (tag !== "all" && !tea.tags.includes(tag)) return false;
        if (status === "untried" && ratedIds != null && ratedIds.has(tea.id))
          return false;
        if (status === "tried" && (ratedIds == null || !ratedIds.has(tea.id)))
          return false;
        if (lowerQuery !== "") {
          const matches =
            tea.name.toLowerCase().includes(lowerQuery) ||
            tea.tags.some(t => t.toLowerCase().includes(lowerQuery));
          if (!matches) return false;
        }
        return true;
      })
      .sort(SORT_COMPARE[sort]);
  }, [teas, ratedIds, tag, status, query, sort]);

  const tagCounts = useMemo(() => {
    const counts: Record<TagKey, number> = {
      all: teas.length,
      black: 0,
      chai: 0,
      citrus: 0,
      fruity: 0,
      white: 0,
    };
    teas.forEach(tea => {
      TAG_KEYS.forEach(key => {
        if (key !== "all" && tea.tags.includes(key)) counts[key] += 1;
      });
    });
    return counts;
  }, [teas]);

  const statusCounts = useMemo(() => {
    const triedCount = teas.filter(
      tea => ratedIds != null && ratedIds.has(tea.id)
    ).length;
    return {
      all: teas.length,
      untried: teas.length - triedCount,
      tried: triedCount,
    } satisfies Record<StatusKey, number>;
  }, [teas, ratedIds]);

  return (
    <>
      <Card padding={14} className={"mb-3"}>
        <div className="flex flex-wrap items-center gap-4">
          <SearchBar
            query={query}
            placeholder="Search teas…"
            onChange={value => setQuery(value)}
            onClear={() => setQuery("")}
          />

          <SelectFilter label="Sort" value={sort} onChange={setSort}>
            <option value="rating">Highest rated</option>
            <option value="rating-asc">Lowest rated</option>
            <option value="votes">Most votes</option>
            <option value="name">Name (A→Z)</option>
          </SelectFilter>

          <ViewPicker view={view} onChange={setView} />
        </div>

        <FilterRow label="Tag">
          {TAG_KEYS.map(key => (
            <Chip
              key={key}
              active={tag === key}
              onClick={() => setTag(key)}
              count={tagCounts[key]}
            >
              {key[0].toUpperCase() + key.substring(1)}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Status">
          {STATUS_KEYS.map(key => (
            <Chip
              key={key}
              active={status === key}
              onClick={() => setStatus(key)}
              count={statusCounts[key]}
            >
              {STATUS_LABELS[key]}
            </Chip>
          ))}
        </FilterRow>
      </Card>

      <div
        className="text-meta flex items-center justify-between"
        style={{ marginBottom: 12 }}
      >
        <div className="text-ink-muted">
          Showing <strong className="text-ink">{filtered.length}</strong> of{" "}
          {teas.length} teas
        </div>
        <div className="text-ink-muted">
          Click any tea for ratings & comments
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div className="text-ink text-feature font-serif">
            {teas.length === 0
              ? "No teas available."
              : "No teas match those filters."}
          </div>
          <div className="text-ink-muted text-meta" style={{ marginTop: 6 }}>
            {teas.length === 0
              ? "Teas will appear here after being added."
              : "Try clearing the filters or widening your search."}
          </div>
        </Card>
      ) : view === "grid" ? (
        <div
          className="grid"
          style={{
            gap: 14,
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          }}
        >
          {filtered.map(tea => (
            <TeaCard
              key={tea.id}
              tea={tea}
              urlPrefix={urlPrefix}
              highlightTag={tag === "all" ? undefined : tag}
              onClick={onClick}
            />
          ))}
        </div>
      ) : (
        <TeaTable teas={filtered} urlPrefix={urlPrefix} />
      )}
    </>
  );
}

function ViewPicker({
  view,
  onChange,
}: {
  view: ViewKey;
  onChange: (value: ViewKey) => void;
}) {
  return (
    <div
      className="border-ink/[0.10] flex overflow-hidden border"
      style={{ borderRadius: 7 }}
    >
      {(["grid", "table"] satisfies ViewKey[]).map(v => {
        const active = view === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange && onChange(v)}
            className={`text-meta cursor-pointer px-3 py-2 font-medium ${active ? "bg-ink text-paper" : "bg-paper text-ink"
              } ${FOCUS_RING.paper}`}
            aria-pressed={active}
          >
            {v === "grid" ? "▦ Grid" : "☰ Table"}
          </button>
        );
      })}
    </div>
  );
}
