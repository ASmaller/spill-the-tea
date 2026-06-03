import { verifySession } from "@/lib/session";
import { getTeaTrend } from "@/services/statisticsService";

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

  const url = new URL(request.url);
  const trend = await getTeaTrend(
    id,
    parseServingLimit(url.searchParams.get("servings"))
  );

  if (!trend) {
    return Response.json({ error: "Tea not found" }, { status: 404 });
  }

  return Response.json(trend);
}
