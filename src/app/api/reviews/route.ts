import {
  ReviewAlreadyExistsError,
  ReviewServingNotFoundError,
  ReviewUserNotFoundError,
  ReviewValidationError,
} from "@/services/reviewErrors";
import { addReview } from "@/services/reviewService";
import { z } from "zod";

const ReviewSchema = z.object({
  teaId: z.string(),
  rating: z.int().min(1).max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ReviewSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const review = await addReview({
      teaId: parsed.data.teaId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      tags: parsed.data.tags,
      userId: null,
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof ReviewTeaNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ReviewAlreadyExistsError) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    if (
      error instanceof ReviewValidationError ||
      error instanceof ReviewUserNotFoundError
    ) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    console.error("Failed to create review", error);
    return Response.json({ error: "Failed to create review" }, { status: 500 });
  }
}
