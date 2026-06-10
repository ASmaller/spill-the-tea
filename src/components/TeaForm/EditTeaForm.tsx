"use client";

import { Tea } from "@/generated/prisma/client";
import { TeaCreateInput } from "@/generated/prisma/models";
import { updateTea } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { TeaForm } from "./TeaForm";

interface Props {
  id: string;
  teaId: string;
  initialTea: Pick<Tea, "name" | "tags">;
  backlink?: string;
}

export function EditTeaForm({ id, teaId, initialTea, backlink }: Props) {
  const router = useRouter();

  return (
    <TeaForm
      id={id}
      initialTea={initialTea}
      backlink={backlink}
      onSubmit={async (tea: TeaCreateInput) => {
        const created = await updateTea(teaId, tea);
        router.push(`/tea/${created.id}`);
      }}
    />
  );
}
