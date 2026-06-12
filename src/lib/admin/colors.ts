export const DIST_COLORS: readonly string[] = [
  "var(--color-rose)",
  "var(--color-rose)",
  "var(--color-amber)",
  "var(--color-sage)",
  "var(--color-sage)",
];

export function ratingColor(r: number): string {
  if (r >= 4) return DIST_COLORS[4];
  if (r >= 3) return DIST_COLORS[2];
  return DIST_COLORS[1];
}
