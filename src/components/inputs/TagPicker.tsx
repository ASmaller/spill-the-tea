"use client";

import { TagEditorDialog } from "@/components/forms/tags/TagEditorDialog";
import { Tag } from "@/generated/prisma/client";
import { FOCUS_RING } from "@/lib/styles";
import { addTag, getTags } from "@/services/tagService";
import { useEffect, useState } from "react";

type Props = {
  value: readonly string[];
  onToggle: (tag: string) => void;
};

export function TagPicker({ value, onToggle }: Props) {
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleAddTag(values: { name: string; color: string }) {
    await addTag(values);
    setDialogOpen(false);
    await refreshTags();
  }

  async function refreshTags() {
    const res = await getTags();
    return res ?? [];
  }

  useEffect(() => {
    let ignore = false;

    refreshTags()
      .then(tags => {
        if (!ignore) setTagOptions(tags);
      })
      .catch(() => {
        if (!ignore) setTagOptions([]);
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
      <TagEditorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddTag}
      />
    </div>
  );
}
