"use server";

import { Review } from "@/generated/prisma/client";
import { ReviewCreateInput } from "@/generated/prisma/models";
import { readClientId } from "@/lib/clientId";
import { prisma } from "@/lib/prisma";
import { isValidRating } from "@/lib/types";
import { ReviewValidationError } from "@/services/reviewErrors";

export async function addReview({
  rating,
  comment,
  tea,
  user,
}: Omit<ReviewCreateInput, 'posted'>) {
  if (!isValidRating(rating)) {
    throw new ReviewValidationError("rating must be an integer from 1 to 5");
  }

  return await prisma.review.create({
    data: {
      rating,
      comment,
      posted: new Date(),
      tea,
      user,
    },
  });
}

export async function getAll() {
  return await prisma.review.findMany();
}

/**
 * Get the ratings of the authenticated user.
 * @returns A record from the tea id to the given rating.
 */
export async function getMyRatings(): Promise<Record<string, number>> {
  const userId = await readClientId();
  if (!userId) return {};

  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { posted: "desc" },
  });

  const seen: Record<string, number> = {};
  for (const r of reviews) {
    if (r.teaId != null && !Object.hasOwn(seen, r.teaId)) {
      seen[r.teaId] = r.rating;
    }
  }

  return seen;
}

export async function getReview(id: string) {
  return await prisma.review.findUnique({
    where: { id },
  });
}

export async function getAllReviewsOnTea(id: string): Promise<Review[] | null> {
  let results = null;
  await prisma.tea
    .findUnique({
      where: { id },
      select: { reviews: true },
    })
    .then(res => {
      results = res?.reviews;
    });
  return results;
}
