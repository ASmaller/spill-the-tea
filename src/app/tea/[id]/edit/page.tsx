"use client";

import { TeaForm } from "@/components/forms/tea/TeaForm";
import { PageShell } from "@/components/layout/PageShell";
import { Tea } from "@/generated/prisma/client";
import { TeaCreateInput } from "@/generated/prisma/models";
import { getTeaById, updateTea } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function EditTeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

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
        backlink={true}
        title={
          <>
            Editing <span className="text-amber">{tea.name}</span>
          </>
        }
      >
        <main>
          <TeaForm
            id={"edit-tea-form"}
            backHref={`/tea/${id}`}
            initialTea={tea}
            onSubmit={async (tea: TeaCreateInput) => {
              const created = await updateTea(id, tea);
              router.push(`/tea/${created.id}`);
            }}
          />
        </main>
      </PageShell>
    </>
  );
}
