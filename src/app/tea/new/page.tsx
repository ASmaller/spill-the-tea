import { BackLink } from "@/components/admin/BackLink";
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
    <PageShell
      title={
        <>
          <BackLink href="/">← Back</BackLink>
          <span>New tea</span>
        </>
      }
      subtitle="Add a tea to the catalog"
    >
      <NewTeaForm id={"new-tea-form"} />
    </PageShell>
  );
}
