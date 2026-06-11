"use client";

import { Dialog } from "@/components/layout/Dialog";
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

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Delete ${tea.name}?`}
        footer={
          <>
            <Button type="button" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button primary danger type="button" onClick={confirmDelete}>
              Delete tea
            </Button>
          </>
        }
      >
        The tea will be removed from the catalog. Past ratings stay in your
        reports but the tea won&apos;t be visible to users.
      </Dialog>
    </div>
  );
}
