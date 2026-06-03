"use client";

import { FOCUS_RING } from "@/lib/styles";
import { TAG_OPTIONS, TeaTag } from "@/lib/types";

type Props = {
  // Loose `string[]` accepts non-DietTag legacy/orphan tags (e.g. `pasta`,
  // `mexican`) read from existing teas. The picker still only toggles
  // DietTag values.
  value: readonly string[];
  onToggle: (tag: TeaTag) => void;
};

export function TagPicker({ value, onToggle }: Props) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {TAG_OPTIONS.map(tag => {
        const on = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(tag)}
            className={`cursor-pointer rounded-full border transition-colors ${FOCUS_RING.paper} ${
              on
                ? "bg-ink text-paper border-ink font-medium"
                : "text-ink-muted border-ink/[0.15] hover:border-ink/30 bg-transparent"
            }`}
            style={{
              padding: "6px 11px",
              fontSize: 12,
            }}
          >
            {on && <span style={{ marginRight: 4 }}>✓</span>}
            {tag}
          </button>
        );
      })}
    </div>
  );
}
