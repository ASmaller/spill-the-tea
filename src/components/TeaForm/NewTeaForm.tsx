"use client";

import { TeaCreateInput } from "@/generated/prisma/models";
import { addTea } from "@/services/teaService";
import { redirect } from "next/navigation";
import { TeaForm } from "./TeaForm";

interface Props {
  id: string;
  backlink?: string;
}

export function NewTeaForm({ id, backlink }: Props) {
  return (
    <TeaForm
      id={id}
      backlink={backlink}
      onSubmit={async (tea: TeaCreateInput) => {
        const created = await addTea(tea);
        redirect(`/tea/${created.id}`);
      }}
    />
  );
}
