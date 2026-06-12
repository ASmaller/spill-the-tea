"use server";

import type { Review } from "@/generated/prisma/client";
import {
  addDays,
  DAY_MS,
  formatShortDate,
  getFeedDateKey,
  getStartOfToday,
  getStartOfWeek,
} from "@/lib/dateFormat";
import { prisma } from "@/lib/prisma";
import type {
  Kpi,
  TagBarItem,
  TeaStat,
  TeaWithReviews,
  TrendSeries,
} from "@/lib/types";
import { isValidRating, NEGATIVE_TAGS, POSITIVE_TAGS } from "@/lib/types";

type RatingDistribution = [number, number, number, number, number];

export type TrendRange = "7d" | "30d" | "1y";

export type AdminOverview = {
  kpis: Kpi[];
  teas: TeaStat[];
};

export type AdminSidebarStats = {
  week: string;
  ratingsThisWeek: number;
};

export type TeaTrend = {
  xLabels: string[];
  series: TrendSeries[];
};

export type TeaDetail = TeaStat & {
  reviews: Review[];
  tagBars: TagBarItem[];
  trend: TeaTrend;
};

type ReviewSnapshot = Pick<
  Review,
  "id" | "rating" | "comment" | "tags" | "posted"
>;

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

function toTeaStat(tea: TeaWithReviews): TeaStat {
  // Compare via UTC date keys so the past/future partition matches
  // scheduleServing's storage (UTC midnight) regardless of server timezone.
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

function buildAverageRatingTrend(reviews: Review[]): TeaTrend {
  if (reviews.length === 0) {
    return {
      xLabels: [],
      series: [
        {
          name: "avg",
          color: "var(--color-tea)",
          data: [],
        },
      ],
    };
  }

  const sortedReviews = reviews.sort(
    (a, b) => a.posted.getTime() - b.posted.getTime()
  );

  // Get review time span
  const firstDay = getStartOfToday(sortedReviews[0].posted);
  const lastDay = getStartOfToday(
    sortedReviews[sortedReviews.length - 1].posted
  );

  // Generate points for average during time span
  const points: { label: string; value: number }[] = [];

  for (
    let currentDate = firstDay;
    currentDate.getTime() <= lastDay.getTime();
    currentDate = addDays(currentDate, 1)
  ) {
    const avg = calculateAverageRatingAtDate(currentDate, sortedReviews);
    if (avg != null) {
      points.push({ label: formatShortDate(currentDate), value: roundTo(avg) });
    }
  }

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

function calculateAverageRatingAtDate(
  date: Date,
  sortedReviews: Review[]
): number | null {
  const timeLessThan = addDays(date, 1).getTime();

  if (sortedReviews.length === 0) return null;

  if (timeLessThan < sortedReviews[0].posted.getTime()) return null;

  if (timeLessThan > sortedReviews[sortedReviews.length - 1].posted.getTime()) {
    // All reviews are before date
    return averageReviewRating(sortedReviews);
  }

  // Use binary search to find included reviews
  let low = 0;
  let high = sortedReviews.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const postedTime = sortedReviews[mid].posted.getTime();

    if (postedTime < timeLessThan) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  const includedReviews = sortedReviews.slice(0, high);
  return averageReviewRating(includedReviews);
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

export async function getAdminSidebarStats(): Promise<AdminSidebarStats> {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const reviewCount = await prisma.review.count({
    where: {
      posted: {
        gte: startOfWeek,
      },
    },
  });

  return {
    week: `Week ${getIsoWeek(now)}`,
    ratingsThisWeek: reviewCount,
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
      posted: {
        gte: startOfPreviousWeek,
        lt: startOfTomorrow,
      },
    },
    select: {
      rating: true,
      comment: true,
      posted: true,
    },
  });

  const currentWeek = reviews.filter(review => review.posted >= startOfWeek);
  const previousWeek = reviews.filter(
    review =>
      review.posted >= startOfPreviousWeek && review.posted < startOfWeek
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
    .filter(review => review.posted >= lastSevenStart)
    .forEach(review => {
      const key = getLocalDateKey(review.posted);
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

export async function getTeaCatalog(): Promise<TeaStat[]> {
  const teas = await prisma.tea.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      reviews: true,
    },
  });

  return teas.map(toTeaStat);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [kpis, teas] = await Promise.all([getAdminKpis(), getTeaCatalog()]);

  return { kpis, teas };
}

export async function getTeaTrend(
  teaId: string,
  limit = 30,
  today = new Date()
): Promise<TeaTrend | null> {
  // UTC-midnight boundary to match reviews storage. Using a
  // local-midnight Date here would mix coordinate systems with the
  // review.posted `@db.Date` column (UTC midnight) and miss reviews near
  // the timezone boundary.
  const todayKey = getFeedDateKey(today);
  const startOfTomorrow = new Date(`${todayKey}T00:00:00.000Z`);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
  const tea = await prisma.tea.findUnique({
    where: { id: teaId },
    include: {
      reviews: {
        where: {
          posted: { lt: startOfTomorrow },
        },
        orderBy: {
          posted: "desc",
        },
        take: limit,
      },
    },
  });

  if (!tea) return null;

  return buildAverageRatingTrend(tea.reviews);
}

export async function getTeaDetail(teaId: string): Promise<TeaDetail | null> {
  const tea = await prisma.tea.findUnique({
    where: { id: teaId },
    include: {
      reviews: {
        orderBy: {
          posted: "desc",
        },
      },
    },
  });

  if (!tea) return null;

  return {
    ...tea,
    ...toTeaStat(tea),
    tagBars: getTagBars(tea.reviews),
    trend: buildAverageRatingTrend(tea.reviews),
  };
}
