"use client";

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  preventClose?: boolean;
};

// Wraps the native <dialog> element so we get focus trap, Escape handling, and
// inert background.
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  preventClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    if (preventClose) {
      e.preventDefault();
      return;
    }
    onClose();
  };

  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current) return;
    if (preventClose) return;
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClick={onBackdropClick}
      className="bg-paper backdrop:bg-ink/50 fixed border-0"
      style={{
        inset: 0,
        margin: "auto",
        width: 420,
        height: "fit-content",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 20px 60px rgb(26 24 21 / 0.3)",
      }}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="text-ink text-center font-serif"
        style={{ fontSize: 22, margin: 0, marginBottom: 8 }}
      >
        {title}
      </h2>
      <div
        className="text-ink-muted text-center"
        style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}
      >
        {children}
      </div>
      <div className="flex gap-2 [&>*]:flex-1">{footer}</div>
    </dialog>
  );
}
