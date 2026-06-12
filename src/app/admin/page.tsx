import { Card } from "@/components/layout/Card";
import { PageShell } from "@/components/layout/PageShell";
import { RankedTeas } from "@/components/lists/RankedTeas";
import { KpiStrip } from "@/components/statistics/KpiStrip";
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
          <span className="text-tea italic">{session.nickname}</span>
        </>
      }
      subtitle={formatToday()}
    >
      <KpiStrip kpis={overview.kpis} />
      <Card style={{ marginBottom: 16 }}>
        <RankedTeas teas={overview.teas} />
      </Card>
    </PageShell>
  );
}
