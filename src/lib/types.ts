import type { Prisma } from "@/generated/prisma/client";
import z from "zod";

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

export const POSITIVE_TAGS = [
  "delicious",
  "energizing",
  "fresh",
  "aromatic",
  "floral",
] as const;

export const NEGATIVE_TAGS = [
  "bland",
  "too sweet",
  "bitter",
  "artificial",
  "weak",
] as const;

export type PositiveReviewTag = (typeof POSITIVE_TAGS)[number];
export type NegativeReviewTag = (typeof NEGATIVE_TAGS)[number];
export type ReviewTag = PositiveReviewTag | NegativeReviewTag;

export type TeaWithRatings = Prisma.TeaGetPayload<{
  include: { reviews: { select: { rating: true } } };
}>;

// TODO: storage pipeline. Picked Files are captured locally and only
// `filename` is set. `url` is populated once a real upload lands.
export type PhotoRef = {
  filename: string;
  url?: string;
};

export type TeaStat = {
  id: string;
  name: string;
  tags: string[];
  rating: number | null;
  votes: number;
  distribution: [number, number, number, number, number];
  photo?: PhotoRef;
};

export type TeaForm = {
  name: string;
  tags: string[];
  photo: PhotoRef | null;
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

/** Properties stored in the session token. */
export const SessionPayload = z.object({
  /** JWT subject/user id. */
  sub: z.string(),
  /** User Gamma ID. */
  gamma_id: z.uuidv4(),
  /** Nickname of the user. */
  nickname: z.string(),
  /** URL to the user's profile picture. */
  picture: z.url().optional(),
  /** Expiration time of the session cookie as a timestamp in seconds. */
  exp: z.number(),
});

export type SessionPayload = z.infer<typeof SessionPayload>;
export type SessionProfile = Omit<SessionPayload, "exp">;
