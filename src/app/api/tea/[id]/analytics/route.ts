import { verifySession } from "@/lib/session";
import { getTeaTrend } from "@/services/statisticsService";

const LIMITS = new Set([10, 30, 100]);

function parseLimit(value: string | null): number {
  const parsed = Number(value);
  return LIMITS.has(parsed) ? parsed : 30;
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
    parseLimit(url.searchParams.get("limit"))
  );

  if (!trend) {
    return Response.json({ error: "Tea not found" }, { status: 404 });
  }

  return Response.json(trend);
}
