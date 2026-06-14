"use server";

import { Prisma, Review } from "@/generated/prisma/client";
import { ReviewCreateInput } from "@/generated/prisma/models";
import { readClientId } from "@/lib/clientId";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isValidRating, NEGATIVE_TAGS, POSITIVE_TAGS } from "@/lib/types";
import { ReviewValidationError } from "@/services/reviewErrors";
import z from "zod";

export type ReviewSubmission = {
  rating: number;
  comment?: string;
  tags: string[];
  teaId: string;
  anonymous?: boolean;
};

export async function submitReview(data: ReviewSubmission): Promise<Review> {
  const tagOptions = Array.from(POSITIVE_TAGS.union(NEGATIVE_TAGS));

  const schema = z.object({
    rating: z.int().gte(1).lte(5),
    comment: z.string().optional(),
    tags: z.array(z.enum(tagOptions)),
    teaId: z.string(),
    anonymous: z.boolean().optional().default(false),
  });

  const validated = schema.parse(data);

  const session = await getSession();

  return addReview({
    rating: validated.rating,
    comment: validated.comment ?? Prisma.skip,
    tags: validated.tags,
    tea: {
      connect: {
        id: validated.teaId,
      },
    },
    user: session
      ? {
          connect: {
            id: session.sub,
          },
        }
      : Prisma.skip,
    anonymous: validated.anonymous,
  });
}

export async function addReview({
  rating,
  comment,
  tags = [],
  tea,
  user,
  anonymous,
}: ReviewCreateInput): Promise<Review> {
  if (!isValidRating(rating)) {
    throw new ReviewValidationError("rating must be an integer from 1 to 5");
  }

  return await prisma.review.create({
    data: {
      rating,
      comment,
      tags,
      posted: new Date(),
      tea,
      anonymous,
      ...(user && { user }),
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

/**
 * Remove the user from this review if it is anonymous.
 * @param review The review to process.
 * @return The processed review.
 */
function processAnonymousReview(review: Review): Review {
  if (review.anonymous) {
    return {
      ...review,
      userId: null,
      anonymous: false,
    };
  }
  return review;
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
      results = res?.reviews.map(review => processAnonymousReview(review));
    });
  return results;
}
