import { verifySession } from "@/lib/session";
import { getAdminMealTrend } from "@/services/statisticsService";

const SERVING_LIMITS = new Set([10, 30, 100]);

function parseServingLimit(value: string | null): number {
  const parsed = Number(value);
  return SERVING_LIMITS.has(parsed) ? parsed : 30;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await verifySession();

  const { id } = await params;
  const lunchId = Number(id);

  if (!Number.isInteger(lunchId) || lunchId <= 0) {
    return Response.json({ error: "Invalid meal id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const trend = await getAdminMealTrend(
    lunchId,
    parseServingLimit(url.searchParams.get("servings"))
  );

  if (!trend) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  return Response.json(trend);
}
