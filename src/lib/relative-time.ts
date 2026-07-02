// TODO(backend): replace with timestamp-based comparisons once Rating /
// Comment models carry real `createdAt` columns. Until then, demo fixtures
// store recency as relative phrases ("5d ago", "Yesterday", "never"); this
// parser turns them into a number-of-days-ago value usable for filtering
// and sorting in both the meal-ranking and comment views.
export function relativeDays(s: string): number | null {
  if (s === "never") return null;
  if (s === "Yesterday") return 1;
  const match = /^(\d+)([hdw]) ago$/.exec(s);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  if (match[2] === "h") return n / 24;
  if (match[2] === "w") return n * 7;
  return n;
}
