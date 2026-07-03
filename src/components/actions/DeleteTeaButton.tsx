"use client";

import { ConfirmDeleteDialog } from "@/components/actions/ConfirmDeleteDialog";
import { Button } from "@/components/primitives/Button";
import { Tea } from "@/generated/prisma/client";
import { deleteTeaById } from "@/services/teaService";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  tea: Pick<Tea, "id" | "name">;
}

export function DeleteTeaButton({ tea }: Props) {
  const router = useRouter();

  const [showDelete, setShowDelete] = useState(false);

  const confirmDelete = async () => {
    setShowDelete(false);
    try {
      await deleteTeaById(tea.id);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Button danger type="button" onClick={() => setShowDelete(true)}>
        Delete
      </Button>

      <ConfirmDeleteDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title={`Delete ${tea.name}?`}
        description={
          <>
            The tea will be removed from the catalog. Past ratings stay in your
            reports but the tea won&apos;t be visible to users.
          </>
        }
        confirmLabel="Delete tea"
      />
    </div>
  );
}
