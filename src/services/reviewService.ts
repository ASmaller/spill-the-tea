"use server";

import { Review } from "@/generated/prisma/client";
import { ReviewCreateInput, ReviewWhereInput, ReviewWhereUniqueInput, UserWhereUniqueInput } from "@/generated/prisma/models";
import { readClientId } from "@/lib/clientId";
import { prisma } from "@/lib/prisma";
import { ReviewValidationError } from "@/services/reviewErrors";

export async function addReview({
  rating,
  comment,
  tags = [],
  tea,
  user
}: ReviewCreateInput) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewValidationError("rating must be an integer from 1 to 5");
  }

  return await prisma.review.create({
    data: {
      rating,
      comment,
      tags,
      posted: new Date(),
      tea,
      user,
    },
  });
}

export async function getAll() {
  return await prisma.review.findMany();
}

export async function getMyReviewSummaries(): Promise<
  { servingId: string; rating: number }[]
> {
  const userId = await readClientId();
  if (!userId) return [];

  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { servingId: true, rating: true },
    orderBy: { posted: "desc" },
  });

  const seen = new Map<number, number>();
  for (const r of reviews)
    if (!seen.has(r.servingId)) seen.set(r.servingId, r.rating);

  return [...seen].map(([servingId, rating]) => ({
    servingId: servingId.toString(),
    rating,
  }));
}

export async function getReview(id: string) {
  return await prisma.review.findUnique({
    where: { id },
  });
}

export async function getAllReviewsOnTea(id: string): Promise<Review[] | null> {
  let results = null;
  await prisma.tea.findUnique({
    where: { id },
    select: { reviews: true }
  }).then((res) => {
    results = res?.reviews
  });
  return results
}
