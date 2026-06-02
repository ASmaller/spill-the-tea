"use server";

import type { Prisma, Review, Tea } from "@/generated/prisma/client";
import { LINE_COLOR, MEAL_LINES } from "@/lib/admin/colors";
import {
  type Kpi,
  type TagBarItem,
  type TeaStat,
  type TrendFootnote,
  type TrendSeries,
} from "@/lib/admin/types";
import { getFeedDateKey } from "@/lib/dateFormat";
import { prisma } from "@/lib/prisma";

type RatingDistribution = [number, number, number, number, number];

export type TrendRange = "7d" | "30d" | "1y";

export type AdminOverviewTrend = {
  xLabels: string[];
  series: TrendSeries[];
  footnotes: TrendFootnote[];
};

export type AdminMealTrend = {
  xLabels: string[];
  series: TrendSeries[];
};

export type AdminOverview = {
  kpis: Kpi[];
  meals: TeaStat[];
  trend: AdminOverviewTrend;
};

export type AdminTeaDetail = TeaStat & {
  comments: Comment[];
  tagBars: TagBarItem[];
  trend: AdminMealTrend;
};

export type AdminSidebarStats = {
  week: string;
  ratingsThisWeek: number;
};

type ReviewSnapshot = Pick<
  Review,
  "id" | "rating" | "comment" | "tags" | "posted"
>;

type TeaWithReviews = Prisma.TeaGetPayload<{ include: { reviews: true } }>;

const DAY_MS = 24 * 60 * 60 * 1000;

const TREND_RANGE_DAYS: Record<TrendRange, number> = {
  "7d": 7,
  "30d": 30,
  "1y": 365,
};

const POSITIVE_TAGS = new Set([
  "delicious",
  "energizing",
  "fresh",
  "aromatic",
  "floral",
]);

const NEGATIVE_TAGS = new Set([
  "bland",
  "too sweet",
  "bitter",
  "artificial",
  "weak",
]);

export type Rating = 1 | 2 | 3 | 4 | 5;

function isValidRating(rating: number): rating is Rating {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

function getStartOfToday(now: Date): Date {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday;
}

function getStartOfWeek(now: Date): Date {
  const startOfWeek = getStartOfToday(now);
  const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  return startOfWeek;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function averageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function getDistribution(ratings: number[]): RatingDistribution {
  const distribution: RatingDistribution = [0, 0, 0, 0, 0];

  for (const rating of ratings) {
    distribution[rating - 1] += 1;
  }

  return distribution;
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKeys(start: Date, days: number): string[] {
  return Array.from({ length: days }, (_, index) =>
    getLocalDateKey(addDays(start, index))
  );
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

function formatShortDate(date: Date | string): string {
  const parsed = typeof date === "string" ? parseDateKey(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

function formatDailyTrendLabel(dateKey: string, totalDays: number): string {
  const date = parseDateKey(dateKey);

  if (totalDays <= 14) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

// One label per calendar month: every month has exactly one Monday whose
// day-of-month is in 1..7, so this produces ~12 labels across a year.
function formatWeeklyTrendLabel(weekKey: string): string {
  const date = parseDateKey(weekKey);
  if (date.getDate() > 7) return "";
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date);
}

function getWeekKeys(start: Date, endExclusive: Date): string[] {
  const keys: string[] = [];
  let cursor = getStartOfWeek(start);
  while (cursor < endExclusive) {
    keys.push(getLocalDateKey(cursor));
    cursor = addDays(cursor, 7);
  }
  return keys;
}

function getWeekKey(date: Date): string {
  return getLocalDateKey(getStartOfWeek(date));
}

function formatRelativeDate(date: Date | null, now = new Date()): string {
  if (!date) return "never";

  const today = getStartOfToday(now);
  const dateStart = getStartOfToday(date);
  const daysAgo = Math.round((today.getTime() - dateStart.getTime()) / DAY_MS);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo}d ago`;
  if (daysAgo >= 7 && daysAgo < 56) return `${Math.floor(daysAgo / 7)}w ago`;

  return formatShortDate(date);
}

function dateToIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function toTeaStat(tea: TeaWithReviews): TeaStat {
  // Compare via UTC date keys so the past/future partition matches
  // scheduleServing's storage (UTC midnight) regardless of server timezone.
  const todayKey = getFeedDateKey(new Date());
  const reviews = tea.reviews;
  const ratings = reviews.map(review => review.rating).filter(isValidRating);
  const rating = averageRating(ratings);
  const distribution = getDistribution(ratings);

  return {
    id: tea.id,
    name: tea.name,
    tags: tea.tags,
    rating: rating == null ? null : roundTo(rating),
    votes: ratings.length,
    distribution,
  };
}

function getTagColor(tag: string): string {
  const normalized = tag.toLowerCase();
  if (POSITIVE_TAGS.has(normalized)) return "var(--color-sage)";
  if (NEGATIVE_TAGS.has(normalized)) return "var(--color-amber)";
  return "var(--color-tea)";
}

const MAX_TAG_BARS = 8;

function getTagBars(reviews: ReviewSnapshot[]): TagBarItem[] {
  const counts = new Map<string, number>();

  for (const review of reviews) {
    for (const rawTag of review.tags) {
      const tag = rawTag.trim().toLowerCase();
      if (!tag) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, color: getTagColor(label) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, MAX_TAG_BARS);
}

function getComments(
  tea: Pick<TeaWithReviews, "id" | "name" | "reviews">
): Comment[] {
  return tea.reviews
    .filter(review => review.comment?.trim())
    .sort((a, b) => b.posted.getTime() - a.posted.getTime())
    .map(review => ({
      id: review.id,
      teaId: tea.id,
      mealName: tea.name,
      rating: review.rating,
      text: review.comment?.trim() ?? "",
      when: formatRelativeDate(review.posted),
      postedAt: review.posted.toISOString(),
      tags: review.tags,
    }));
}

function buildMealTrend(servings: TeaWithReviews[]): AdminMealTrend {
  const points = [...servings]
    .sort((a, b) => a.posted.getTime() - b.date.getTime())
    .flatMap(serving => {
      const ratings = serving.reviews
        .map(review => review.rating)
        .filter(isValidRating);
      const avg = averageRating(ratings);
      if (avg == null) return [];

      return [{ label: formatShortDate(serving.date), value: roundTo(avg) }];
    });

  return {
    xLabels: points.map(point => point.label),
    series: [
      {
        name: "avg",
        color: "var(--color-tea)",
        data: points.map(point => point.value),
      },
    ],
  };
}

function getRangeWindow(range: TrendRange, now = new Date()) {
  const days = TREND_RANGE_DAYS[range];
  const endExclusive = addDays(getStartOfToday(now), 1);
  const start = addDays(endExclusive, -days);
  const previousStart = addDays(start, -days);

  return { days, start, endExclusive, previousStart };
}

function formatTrend(delta: number | null, decimals = 1): string {
  // Hide anything that would round to 0 at the chosen precision.
  const cutoff = 0.5 * 10 ** -decimals;
  if (delta == null || Math.abs(delta) < cutoff) return "—";
  const arrow = delta > 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(roundTo(delta, decimals)).toLocaleString(
    "en-GB"
  )}`;
}

function averageReviewRating(reviews: Pick<Review, "rating">[]): number | null {
  return averageRating(
    reviews.map(review => review.rating).filter(isValidRating)
  );
}

function getPercentDelta(current: number, previous: number): string {
  if (current === 0 && previous === 0) return "—";
  if (previous === 0) return `↑ ${current}`;

  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return "—";
  return `${percent > 0 ? "↑" : "↓"} ${Math.abs(percent)}%`;
}

function getIsoWeek(now: Date): number {
  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
}

type TrendGrain = "day" | "week";

function formatBucketValue(grain: TrendGrain, key: string): string {
  const short = formatShortDate(key);
  return grain === "week" ? `Wk of ${short}` : short;
}

function getTrendFootnotes(
  grain: TrendGrain,
  bucketKeys: string[],
  reviewsByBucket: Map<string, { sum: number; count: number }>,
  currentAverage: number | null,
  previousAverage: number | null
): TrendFootnote[] {
  let best: { key: string; avg: number; count: number } | null = null;
  let worst: { key: string; avg: number; count: number } | null = null;

  for (const key of bucketKeys) {
    const bucket = reviewsByBucket.get(key);
    if (!bucket || bucket.count === 0) continue;

    const point = { key, avg: bucket.sum / bucket.count, count: bucket.count };
    if (!best || point.avg > best.avg) best = point;
    if (!worst || point.avg < worst.avg) worst = point;
  }

  const delta =
    currentAverage == null || previousAverage == null
      ? null
      : currentAverage - previousAverage;
  const unit = grain === "week" ? "week" : "day";

  return [
    {
      label: `Best ${unit}`,
      value: best ? formatBucketValue(grain, best.key) : "—",
      sub: best
        ? `${roundTo(best.avg).toFixed(1)} avg · ${best.count} ratings`
        : "No ratings in range",
      tone: "var(--color-sage)",
    },
    {
      label: `Worst ${unit}`,
      value: worst ? formatBucketValue(grain, worst.key) : "—",
      sub: worst
        ? `${roundTo(worst.avg).toFixed(1)} avg · ${worst.count} ratings`
        : "No ratings in range",
      tone: "var(--color-rose)",
    },
    {
      label: "Range delta",
      value: formatTrend(delta),
      sub: "vs. previous equal range",
      tone:
        delta == null || delta >= 0 ? "var(--color-tea)" : "var(--color-rose)",
    },
  ];
}

export async function getAdminSidebarStats(): Promise<AdminSidebarStats> {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const reviews = await prisma.review.findMany({
    where: {
      serving: {
        date: {
          gte: startOfWeek,
        },
      },
    },
    select: { id: true },
  });

  return {
    week: `Week ${getIsoWeek(now)}`,
    ratingsThisWeek: reviews.length,
  };
}

export async function getAdminKpis(): Promise<Kpi[]> {
  const now = new Date();
  const startOfToday = getStartOfToday(now);
  const startOfTomorrow = addDays(startOfToday, 1);
  const startOfWeek = getStartOfWeek(now);
  const startOfPreviousWeek = addDays(startOfWeek, -7);
  const lastSevenStart = addDays(startOfToday, -6);

  const reviews = await prisma.review.findMany({
    where: {
      serving: {
        date: {
          gte: startOfPreviousWeek,
          lt: startOfTomorrow,
        },
      },
    },
    select: {
      rating: true,
      comment: true,
      serving: { select: { date: true } },
    },
  });

  const currentWeek = reviews.filter(
    review => review.serving.date >= startOfWeek
  );
  const previousWeek = reviews.filter(
    review =>
      review.serving.date >= startOfPreviousWeek &&
      review.serving.date < startOfWeek
  );
  const currentWeekAverage = averageReviewRating(currentWeek) ?? 0;
  const previousWeekAverage = averageReviewRating(previousWeek);
  const weekComments = currentWeek.filter(review => review.comment?.trim());
  const previousWeekComments = previousWeek.filter(review =>
    review.comment?.trim()
  );
  const sparkKeys = getDateKeys(lastSevenStart, 7);
  const sparkBuckets = new Map<
    string,
    { ratings: number[]; ratingCount: number; commentCount: number }
  >();

  sparkKeys.forEach(key =>
    sparkBuckets.set(key, { ratings: [], ratingCount: 0, commentCount: 0 })
  );

  reviews
    .filter(review => review.serving.date >= lastSevenStart)
    .forEach(review => {
      const key = getLocalDateKey(review.serving.date);
      const bucket = sparkBuckets.get(key);
      if (!bucket) return;
      if (isValidRating(review.rating)) {
        bucket.ratings.push(review.rating);
        bucket.ratingCount += 1;
      }
      if (review.comment?.trim()) bucket.commentCount += 1;
    });

  const avgSpark = sparkKeys.map(key => {
    const avg = averageRating(sparkBuckets.get(key)?.ratings ?? []);
    return avg == null ? 0 : roundTo(avg);
  });
  const ratingsSpark = sparkKeys.map(
    key => sparkBuckets.get(key)?.ratingCount ?? 0
  );
  const commentsSpark = sparkKeys.map(
    key => sparkBuckets.get(key)?.commentCount ?? 0
  );
  const commentShare =
    currentWeek.length > 0
      ? `${Math.round((weekComments.length / currentWeek.length) * 100)}% of ratings`
      : "0% of ratings";

  return [
    {
      label: "Avg rating · week",
      value: currentWeekAverage.toFixed(1),
      trend: formatTrend(
        previousWeekAverage == null
          ? null
          : currentWeekAverage - previousWeekAverage
      ),
      sub: "vs. last week",
      spark: avgSpark,
      color: "var(--color-tea)",
    },
    {
      label: "Ratings · week",
      value: String(currentWeek.length),
      trend: getPercentDelta(currentWeek.length, previousWeek.length),
      sub: "vs. last week",
      spark: ratingsSpark,
      color: "var(--color-amber)",
    },
    {
      label: "Comments · week",
      value: String(weekComments.length),
      trend: getPercentDelta(weekComments.length, previousWeekComments.length),
      sub: commentShare,
      spark: commentsSpark,
      color: "var(--color-rose)",
    },
  ];
}

export async function getAdminMealCatalog(): Promise<TeaStat[]> {
  const lunches = await prisma.tea.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return lunches.map(toMealStat);
}

export async function getAdminOverviewTrend(
  range: TrendRange = "30d"
): Promise<AdminOverviewTrend> {
  const { days, start, endExclusive, previousStart } = getRangeWindow(range);
  const grain: TrendGrain = range === "1y" ? "week" : "day";
  const bucketKeys =
    grain === "week"
      ? getWeekKeys(start, endExclusive)
      : getDateKeys(start, days);
  const bucketKeyFor = (date: Date) =>
    grain === "week" ? getWeekKey(date) : getLocalDateKey(date);
  const formatAxisLabel = (key: string) =>
    grain === "week"
      ? formatWeeklyTrendLabel(key)
      : formatDailyTrendLabel(key, days);
  const [currentReviews, previousReviews] = await Promise.all([
    prisma.review.findMany({
      where: {
        serving: {
          date: {
            gte: start,
            lt: endExclusive,
          },
        },
      },
      select: {
        rating: true,
        serving: {
          select: {
            date: true,
            lunch: {
              select: {
                line: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.findMany({
      where: {
        serving: {
          date: {
            gte: previousStart,
            lt: start,
          },
        },
      },
      select: {
        rating: true,
      },
    }),
  ]);
  const lineBuckets = new Map<
    MealLine,
    Map<string, { sum: number; count: number }>
  >();
  const overallBuckets = new Map<string, { sum: number; count: number }>();

  MEAL_LINES.forEach(line => {
    const bucketMap = new Map<string, { sum: number; count: number }>();
    bucketKeys.forEach(key => bucketMap.set(key, { sum: 0, count: 0 }));
    lineBuckets.set(line, bucketMap);
  });
  bucketKeys.forEach(key => overallBuckets.set(key, { sum: 0, count: 0 }));

  for (const review of currentReviews) {
    if (!isValidRating(review.rating)) continue;

    const key = bucketKeyFor(review.serving.date);
    const line = getMealLine(review.serving.lunch.line);
    const lineBucket = lineBuckets.get(line)?.get(key);
    const overallBucket = overallBuckets.get(key);

    if (lineBucket) {
      lineBucket.sum += review.rating;
      lineBucket.count += 1;
    }

    if (overallBucket) {
      overallBucket.sum += review.rating;
      overallBucket.count += 1;
    }
  }

  const series = MEAL_LINES.map(line => {
    const buckets = lineBuckets.get(line);
    return {
      name: line,
      color: LINE_COLOR[line],
      data: bucketKeys.map(key => {
        const bucket = buckets?.get(key);
        if (!bucket || bucket.count === 0) return 0;
        return roundTo(bucket.sum / bucket.count);
      }),
    };
  });
  const currentAverage = averageReviewRating(currentReviews);
  const previousAverage = averageReviewRating(previousReviews);

  return {
    xLabels: bucketKeys.map(formatAxisLabel),
    series,
    footnotes: getTrendFootnotes(
      grain,
      bucketKeys,
      overallBuckets,
      currentAverage,
      previousAverage
    ),
  };
}

export async function getAdminOverview(
  range: TrendRange = "30d"
): Promise<AdminOverview> {
  const [kpis, meals, trend] = await Promise.all([
    getAdminKpis(),
    getAdminMealCatalog(),
    getAdminOverviewTrend(range),
  ]);

  return { kpis, meals, trend };
}

export async function getAdminMealTrend(
  lunchId: number,
  servingLimit = 30
): Promise<AdminMealTrend | null> {
  // UTC-midnight boundary to match scheduleServing's storage. Using a
  // local-midnight Date here would mix coordinate systems with the
  // serving.date `@db.Date` column (UTC midnight) and miss servings near
  // the timezone boundary.
  const todayKey = getFeedDateKey(new Date());
  const startOfTomorrow = new Date(`${todayKey}T00:00:00.000Z`);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
  const lunch = await prisma.lunch.findUnique({
    where: { id: lunchId },
    select: {
      id: true,
      servings: {
        where: {
          date: { lt: startOfTomorrow },
        },
        orderBy: {
          date: "desc",
        },
        take: servingLimit,
        include: {
          reviews: true,
        },
      },
    },
  });

  if (!lunch) return null;
  return buildMealTrend(lunch.servings);
}

export async function getAdminMealDetail(
  lunchId: number
): Promise<AdminMealDetail | null> {
  const lunch = await prisma.lunch.findUnique({
    where: { id: lunchId },
    include: {
      ingredients: true,
      servings: {
        orderBy: {
          date: "desc",
        },
        include: {
          reviews: true,
        },
      },
    },
  });

  if (!lunch) return null;

  const meal = toMealStat(lunch);
  const todayKey = getFeedDateKey(new Date());
  const pastServings = lunch.servings.filter(
    serving => getFeedDateKey(serving.date) <= todayKey
  );
  const reviews = getAllReviews(pastServings);
  const upcomingServings: UpcomingServing[] = lunch.servings
    .filter(serving => getFeedDateKey(serving.date) > todayKey)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(serving => ({
      id: serving.id,
      date: getFeedDateKey(serving.date),
    }));

  return {
    ...meal,
    comments: getComments(lunch, pastServings),
    tagBars: getTagBars(reviews),
    trend: buildMealTrend(pastServings.slice(0, 30)),
    upcomingServings,
  };
}
