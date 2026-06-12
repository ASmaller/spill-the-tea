"use client";

import { TeaCreateInput } from "@/generated/prisma/models";
import { addTea } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { TeaForm, Props as TeaFormProps } from "./TeaForm";

export type Props = Omit<TeaFormProps, "onSubmit">;

export function NewTeaForm(props: Props) {
  const router = useRouter();

  return (
    <TeaForm
      {...props}
      onSubmit={async (tea: TeaCreateInput, file?: File | null) => {
        const created = await addTea(tea, file ?? undefined);
        router.push(`/tea/${created.id}`);
      }}
    />
  );
}
