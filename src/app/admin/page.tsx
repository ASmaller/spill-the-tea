import { PageShell } from "@/components/admin/PageShell";
import { KpiStrip } from "@/components/admin/sections/KpiStrip";
import { RankedTeas } from "@/components/admin/sections/RankedTeas";
import { TrendCard } from "@/components/admin/sections/TrendCard";
import { Card } from "@/components/ui/Card";
import { verifySession } from "@/lib/session";
import { getAdminOverview } from "@/services/statisticsService";

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function AdminOverviewPage() {
  const session = await verifySession();
  const overview = await getAdminOverview();

  return (
    <PageShell
      title={
        <>
          Good morning,{" "}
          <span className="text-amber italic">{session.given_name}</span>
        </>
      }
      subtitle={formatToday()}
    >
      <KpiStrip kpis={overview.kpis} />
      <Card style={{ marginBottom: 16 }}>
        <RankedTeas teas={overview.meals} />
      </Card>
      <TrendCard initialTrend={overview.trend} />
    </PageShell>
  );
}
