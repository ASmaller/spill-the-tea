"use client";

import { BackLink } from "@/components/admin/BackLink";
import { PageShell } from "@/components/admin/PageShell";
import { EditTeaForm } from "@/components/TeaForm/EditTeaForm";
import { Tea } from "@/generated/prisma/client";
import { getTeaById } from "@/services/teaService";
import { use, useEffect, useState } from "react";

export default function EditTeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [tea, setTea] = useState<Tea | null>(null);

  useEffect(() => {
    getTeaById(id)
      .catch(reason => {
        console.warn(reason);
        return null;
      })
      .then(tea => {
        setIsLoading(false);
        setTea(tea);
      });
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!tea) {
    return <p>Could not find tea</p>;
  }

  return (
    <>
      <PageShell
        backlink={<BackLink href={`/tea/${id}`}>← {tea.name}</BackLink>}
        title={"Edit tea"}
      >
        <main>
          <EditTeaForm id={"edit-tea-form"} teaId={id} initialTea={tea} />
        </main>
      </PageShell>
    </>
  );
}
