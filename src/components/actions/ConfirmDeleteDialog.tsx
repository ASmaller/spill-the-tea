"use client";

import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/primitives/Button";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button type="button" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button primary danger type="button" onClick={() => void onConfirm()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description}
    </Dialog>
  );
}
