"use client";

import { SuggestionAndUser } from "@/app/admin/suggestions/page";
import { Card } from "@/components/layout/Card";
import { Chip } from "@/components/primitives/Chip";
import { FilterRow } from "@/components/search/FilterRow";
import { SearchBar } from "@/components/search/SearchBar";
import { SelectFilter } from "@/components/search/SelectFilter";
import { isNewSuggestion } from "@/lib/suggestions";
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
          <SearchBar
            query={query}
            onChange={value => setQuery(value)}
            onClear={() => setQuery("")}
            placeholder="Search suggestions…"
          />

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
