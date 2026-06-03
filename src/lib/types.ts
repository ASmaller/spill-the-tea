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
