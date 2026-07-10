"use client";

import { TeaForm } from "@/components/forms/tea/TeaForm";
import { PageShell } from "@/components/layout/PageShell";
import {
  getTeaById,
  updateTea,
  type TeaFormValues,
  type TeaWithTags,
} from "@/services/teaService";
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
  const [tea, setTea] = useState<TeaWithTags | null>(null);

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

  const initialTea = {
    name: tea.name,
    image: tea.image,
    tags: tea.tags.map(tag => tag.name),
  };

  return (
    <>
      <PageShell
        backlink={true}
        title={
          <>
            Editing <span className="text-tea">{tea.name}</span>
          </>
        }
      >
        <main>
          <TeaForm
            id={"edit-tea-form"}
            backHref={`/tea/${id}`}
            initialTea={initialTea}
            onSubmit={async (tea: TeaFormValues, file?: File | null) => {
              const payload: TeaFormValues = {
                name: tea.name,
                tags: tea.tags,
              };

              const created = await updateTea(id, payload, file ?? undefined);
              router.push(`/tea/${created.id}`);
            }}
          />
        </main>
      </PageShell>
    </>
  );
}
