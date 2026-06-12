import { NewTeaForm } from "@/components/forms/tea/NewTeaForm";
import { PageShell } from "@/components/layout/PageShell";
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
