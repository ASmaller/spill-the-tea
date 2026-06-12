import type { Prisma } from "@/generated/prisma/client";

export type Rating = 1 | 2 | 3 | 4 | 5;

export function isValidRating(rating: number): rating is Rating {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export type RatingPayload = {
  teaId: string;
  rating: number;
  tags: string[];
  comment: string;
};

export const POSITIVE_TAGS = new Set([
  "delicious",
  "energizing",
  "fresh",
  "aromatic",
  "floral",
]);

export const NEGATIVE_TAGS = new Set([
  "bland",
  "too sweet",
  "bitter",
  "artificial",
  "weak",
]);

export type TeaWithReviews = Prisma.TeaGetPayload<{
  include: { reviews: true };
}>;

// TODO: storage pipeline. Picked Files are captured locally and only
// `filename` is set. `url` is populated once a real upload lands.
export type TeaStat = {
  id: string;
  name: string;
  tags: string[];
  rating: number | null;
  votes: number;
  distribution: [number, number, number, number, number];
  image: string;
};

export type TeaForm = {
  name: string;
  tags: string[];
  image: string;
};

// TODO: Move to database and allow admin user to update
export const TAG_OPTIONS = [
  "black",
  "citrus",
  "fruity",
  "white",
  "chai",
] as const;
export type TeaTag = (typeof TAG_OPTIONS)[number];

export function isTeaTag(maybeTeaTag: unknown): maybeTeaTag is TeaTag {
  return (
    typeof maybeTeaTag === "string" &&
    (TAG_OPTIONS as readonly string[]).includes(maybeTeaTag)
  );
}

export type TrendSeries = {
  name: string;
  color: string;
  data: number[];
};

export type TrendFootnote = {
  label: string;
  value: string;
  sub: string;
  tone: string;
};

export type TagBarItem = {
  label: string;
  count: number;
  color?: string;
};

export type Kpi = {
  label: string;
  value: string;
  trend: string;
  sub: string;
  spark: number[];
  color: string;
};
