import { PageShell } from "@/components/admin/PageShell";
import { TeaBrowser } from "@/components/TeaBrowser/TeaBrowser";
import { buttonClassName } from "@/components/ui/Button";
import { getAdminMealCatalog } from "@/services/statisticsService";
import Link from "next/link";

export default async function AdminTeaPage() {
  const teas = await getAdminMealCatalog();

  return (
    <PageShell
      title="Tea"
      subtitle="Your full catalog · search, browse, and schedule"
      actions={
        <Link href="/admin/teas/new" className={buttonClassName(true)}>
          + New tea
        </Link>
      }
    >
      <TeaBrowser teas={teas} urlPrefix="/admin/teas/" />
    </PageShell>
  );
}
