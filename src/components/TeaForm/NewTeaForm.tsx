"use client";

import { TeaCreateInput } from "@/generated/prisma/models";
import { addTea } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { TeaForm } from "./TeaForm";

interface Props {
  id: string;
  backlink?: string;
}

export function NewTeaForm({ id, backlink }: Props) {
  const router = useRouter();

  return (
    <TeaForm
      id={id}
      backlink={backlink}
      onSubmit={async (tea: TeaCreateInput) => {
        const created = await addTea(tea);
        router.push(`/tea/${created.id}`);
      }}
    />
  );
}
