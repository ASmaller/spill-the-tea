"use client";

import { TeaCreateInput } from "@/generated/prisma/models";
import { addTea, uploadImage } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { TeaForm, Props as TeaFormProps } from "./TeaForm";

export type Props = Omit<TeaFormProps, "onSubmit">;

export function NewTeaForm(props: Props) {
  const router = useRouter();

  return (
    <TeaForm
      {...props}
      onSubmit={async (tea: TeaCreateInput, file?: File | null) => {
        if (file) {
          const imagnUrl = await uploadImage(file);
          tea.image = imagnUrl;
        }
        const created = await addTea(tea);
        router.push(`/tea/${created.id}`);
      }}
    />
  );
}
