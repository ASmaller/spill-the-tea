import { PageShell } from "@/components/admin/PageShell";
import { NewTeaForm } from "@/components/TeaForm/NewTeaForm";
import { isAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NewTeaPage() {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/login");
  }

  return (
    <PageShell title={"New tea"} subtitle="Add a tea to the catalog">
      <main>
        <NewTeaForm id={"new-tea-form"} />
      </main>
    </PageShell>
  );
}
