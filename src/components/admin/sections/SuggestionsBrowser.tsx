"use client";

import { SuggestionAndUser } from "@/app/admin/suggestions/page";
import { SelectFilter } from "@/components/admin/SelectFilter";
import { Card } from "@/components/ui/Card";
import { isNewSuggestion } from "@/lib/admin/suggestions";
import { FOCUS_RING } from "@/lib/styles";
import { useMemo, useState } from "react";
import { SuggestionsTable } from "./SuggestionsTable";

type Props = { suggestions: SuggestionAndUser[]; lastViewed: Date };

type StatusKey = "all" | "viewed" | "new";
type SortKey = "newest" | "oldest" | "title" | "title-asc";

const STATUS_KEYS: readonly StatusKey[] = ["all", "viewed", "new"];
const STATUS_LABELS = {
  all: "All",
  viewed: "Viewed",
  new: "New",
} satisfies Record<StatusKey, string>;

const SORT_COMPARE: Record<
  SortKey,
  (a: SuggestionAndUser, b: SuggestionAndUser) => number
> = {
  newest: (a, b) =>
    (b.postedDate.getTime() ?? -1) - (a.postedDate.getTime() ?? -1),
  oldest: (a, b) =>
    (a.postedDate.getTime() ?? Infinity) - (b.postedDate.getTime() ?? Infinity),
  title: (a, b) => a.title.localeCompare(b.title),
  "title-asc": (a, b) => b.title.localeCompare(a.title),
};

export function SuggestionsBrowser({ suggestions, lastViewed }: Props) {
  const [status, setStatus] = useState<StatusKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const queryLower = query.trim().toLowerCase();
    return suggestions
      .filter(suggestion => {
        if (status === "new" && !isNewSuggestion(suggestion, lastViewed))
          return false;
        if (status === "viewed" && isNewSuggestion(suggestion, lastViewed))
          return false;
        if (queryLower != "") {
          const matches =
            suggestion.title.toLowerCase().includes(queryLower) ||
            suggestion.description.toLowerCase().includes(queryLower);
          if (!matches) return false;
        }
        return true;
      })
      .sort(SORT_COMPARE[sort]);
  }, [suggestions, status, query, sort, lastViewed]);

  const statusCounts = useMemo(() => {
    const newCount = suggestions.filter(suggestion =>
      isNewSuggestion(suggestion, lastViewed)
    ).length;
    return {
      all: suggestions.length,
      viewed: suggestions.length - newCount,
      new: newCount,
    } satisfies Record<StatusKey, number>;
  }, [suggestions, lastViewed]);

  return (
    <>
      <Card padding={14} style={{ marginBottom: 12 }}>
        <div className="flex items-center" style={{ gap: 10 }}>
          <div
            className="bg-cream border-ink/[0.10] flex flex-1 items-center border"
            style={{ padding: "8px 12px", borderRadius: 9, gap: 8 }}
          >
            <SearchIcon />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search suggestions…"
              className={`text-ink text-body flex-1 rounded-sm bg-transparent outline-none ${FOCUS_RING.cream}`}
              style={{ fontFamily: "inherit" }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className={`text-ink-soft text-meta cursor-pointer rounded-sm ${FOCUS_RING.cream}`}
              >
                ✕
              </button>
            )}
          </div>

          <SelectFilter label="Sort" value={sort} onChange={setSort}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title (A→Z)</option>
            <option value="title-asc">Title (Z→A)</option>
          </SelectFilter>
        </div>

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
          {suggestions.length} suggestions
        </div>
        <div className="text-ink-muted">
          Click any suggestion for full description
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div className="text-ink text-feature font-serif">
            No suggestions match those filters.
          </div>
          <div className="text-ink-muted text-meta" style={{ marginTop: 6 }}>
            Try clearing the filters or widening your search.
          </div>
        </Card>
      ) : (
        <SuggestionsTable suggestions={filtered} lastViewed={lastViewed} />
      )}
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-center"
      style={{ gap: 14, marginTop: 12 }}
    >
      <div
        className="text-ink-soft text-eyebrow uppercase"
        style={{ width: 48 }}
      >
        {label}
      </div>
      <div className="flex flex-wrap" style={{ gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-meta flex items-center font-medium ${
        active
          ? "bg-ink text-paper"
          : "bg-paper text-ink border-ink/[0.10] border"
      } ${FOCUS_RING.paper}`}
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        cursor: "pointer",
        gap: 5,
      }}
      aria-pressed={active}
    >
      {children}
      {count != null && (
        <span
          className={`text-tiny tabular-nums ${
            active ? "text-paper/70" : "text-ink-soft"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ink-soft"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
