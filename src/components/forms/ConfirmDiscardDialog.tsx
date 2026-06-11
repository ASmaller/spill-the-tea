"use client";

import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/primitives/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDiscardDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Discard changes?"
      footer={
        <>
          <Button type="button" onClick={onClose}>
            Keep editing
          </Button>
          <Button primary danger type="button" onClick={onConfirm}>
            Discard
          </Button>
        </>
      }
    >
      Anything you&apos;ve typed will be lost.
    </Dialog>
  );
}
