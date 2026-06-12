export function ratingTotal(dist: readonly number[]): number {
  return dist.reduce((sum, count) => sum + count, 0);
}

export function ratingAverage(dist: readonly number[]): number {
  const total = ratingTotal(dist);
  return total > 0
    ? dist.reduce((sum, count, index) => sum + count * (index + 1), 0) / total
    : 0;
}

export function interpretRatingDistribution(dist: readonly number[]): string {
  const lows = dist[0] ?? 0;
  const highs = dist[4] ?? 0;
  if (highs > lows * 4) return "strongly positive";
  if (lows > highs * 4) return "strongly negative";
  if (lows > highs) return "polarized";
  return "mixed.";
}
