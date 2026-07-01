"use client";

import { Tag } from "@/generated/prisma/client";
import { FOCUS_RING } from "@/lib/styles";
import { addTag, getTags } from "@/services/tagService";
import { useEffect, useState } from "react";
import { Dialog } from "../layout/Dialog";
import { Button } from "../primitives/Button";
import { TextInput } from "./TextInput";

type Props = {
  // Loose `string[]` accepts non-DietTag legacy/orphan tags (e.g. `pasta`,
  // `mexican`) read from existing teas. The picker still only toggles
  // DietTag values.
  value: readonly string[];
  onToggle: (tag: string) => void;
};

export function TagPicker({ value, onToggle }: Props) {
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // TODO: Move into separate component
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");

  function handleAddTag() {
    setIsSubmitting(true);

    addTag({ name: newTagName, color: newTagColor });

    setDialogOpen(false);
    setNewTagName("");
    setNewTagColor("");
    setIsSubmitting(false);
  }

  useEffect(() => {
    let ignore = false;

    getTags().then(res => {
      if (!ignore) {
        setTagOptions(res ? res : []);
        console.log(res);
      }
    });

    return () => {
      ignore = true;
    };
  }, [dialogOpen]);

  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {tagOptions.map(tag => {
        const on = value.includes(tag.name);
        return (
          <button
            key={tag.name}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(tag.name)}
            className={`cursor-pointer rounded-full border transition-colors ${FOCUS_RING.paper} ${
              on
                ? "text-paper border-ink font-medium"
                : "text-ink-muted border-ink/0.15 hover:border-ink/30 bg-transparent"
            }`}
            style={{
              padding: "6px 11px",
              fontSize: 12,
              backgroundColor: `${on ? tag.color : ""}`,
              borderColor: tag.color,
            }}
          >
            {on && <span style={{ marginRight: 4 }}>✓</span>}
            {tag.name}
          </button>
        );
      })}
      <button
        className={`w-8 cursor-pointer rounded-full border transition-colors ${FOCUS_RING.paper} text-ink-muted border-ink/0.15 hover:border-ink/30 bg-transparent`}
        onClick={e => {
          e.preventDefault();
          setDialogOpen(true);
        }}
      >
        +
      </button>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        title="Create tag"
        footer={
          <>
            <Button
              type="button"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              primary
              onClick={handleAddTag}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create tag"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-left">
          <label className="text-ink text-sm font-medium">Tag name</label>
          <TextInput
            value={newTagName}
            onChange={setNewTagName}
            placeholder="e.g. Floral"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddTag();
              }
            }}
          />
          <input
            type="color"
            value={newTagColor}
            onChange={e => {
              setNewTagColor(e.target.value);
            }}
          />
          {errorMessage && <p className="text-rose text-xs">{errorMessage}</p>}
        </div>
      </Dialog>
    </div>
  );
}
