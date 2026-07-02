import { SuggestionAndUser } from "@/app/admin/suggestions/page";
import { Card } from "@/components/layout/Card";
import { Pill } from "@/components/primitives/Pill";
import { formatPostedDate } from "@/lib/dateFormat";
import { FOCUS_RING } from "@/lib/styles";
import { isNewSuggestion } from "@/lib/suggestions";
import Link from "next/link";

type Props = { suggestions: SuggestionAndUser[]; lastViewed: Date };

const COLS = "3fr 1fr 1fr 32px";

export function SuggestionsTable({ suggestions, lastViewed }: Props) {
  return (
    <Card padding={0}>
      <div
        className="text-ink-soft text-eyebrow border-ink/[0.06] grid border-b uppercase"
        style={{ gridTemplateColumns: COLS, padding: "10px 16px" }}
      >
        <div>Title</div>
        <div>Posted</div>
        <div>Left by</div>
      </div>
      {suggestions.map((suggestion, i) => (
        <Link
          key={suggestion.id}
          href={`/admin/suggestions/${suggestion.id}`}
          className={`hover:bg-ink/[0.03] text-body grid items-center transition-colors ${FOCUS_RING.paper}`}
          style={{
            gridTemplateColumns: COLS,
            padding: "10px 16px",
            borderTop: i === 0 ? "none" : "1px solid rgba(26,24,21,0.04)",
            cursor: "pointer",
          }}
        >
          <div className="flex min-w-0 items-center gap-1">
            <div className="text-ink inline-block truncate font-medium">
              {suggestion.title}
            </div>
            <div className="min-w-0">
              {isNewSuggestion(suggestion, lastViewed) && (
                <Pill tone="warn">New</Pill>
              )}
            </div>
          </div>
          <div className="min-w-0">
            {formatPostedDate(suggestion.postedDate)}
          </div>
          <div className="min-w-0">
            {suggestion.displayName || (
              <i className="text-ink-muted">Anonymous</i>
            )}
          </div>
          <div className="text-ink-soft text-right">›</div>
        </Link>
      ))}
    </Card>
  );
}
