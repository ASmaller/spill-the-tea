"use client";

import { TextInput } from "@/components/inputs/TextInput";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/primitives/Button";
import type { Tag } from "@/generated/prisma/client";
import { useState } from "react";

const DEFAULT_COLOR = "#7c3aed";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTag?: Pick<Tag, "id" | "name" | "color"> | null;
  onSubmit: (values: { name: string; color: string }) => Promise<void> | void;
  title?: string;
  submitLabel?: string;
};

type TagEditorFormProps = Props & {
  formKey: string;
};

function TagEditorForm({
  formKey,
  onClose,
  initialTag,
  onSubmit,
  title = "Create tag",
  submitLabel = "Create tag",
}: TagEditorFormProps) {
  const [name, setName] = useState(initialTag?.name ?? "");
  const [color, setColor] = useState(initialTag?.color ?? DEFAULT_COLOR);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Tag name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, color });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setName("");
    setColor(DEFAULT_COLOR);
    setErrorMessage("");
    onClose();
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            primary
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </>
      }
    >
      <div key={formKey} className="flex flex-col gap-3 text-left">
        <label htmlFor="tag-name" className="text-ink text-sm font-medium">
          Tag name
        </label>
        <TextInput
          id="tag-name"
          value={name}
          onChange={value => {
            setName(value);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder="e.g. Floral"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSubmit();
            }
          }}
        />

        <label htmlFor="tag-color" className="text-ink text-sm font-medium">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            id="tag-color"
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="border-ink/10 h-10 w-10 cursor-pointer rounded border bg-transparent p-0"
          />
          <TextInput
            id="tag-color-text"
            value={color}
            onChange={setColor}
            className="font-mono uppercase"
          />
        </div>

        {errorMessage && <p className="text-rose text-xs">{errorMessage}</p>}
      </div>
    </Dialog>
  );
}

export function TagEditorDialog(props: Props) {
  const formKey = props.open ? (props.initialTag?.id ?? "new") : "closed";

  if (!props.open) {
    return null;
  }

  return <TagEditorForm key={formKey} {...props} formKey={formKey} />;
}
