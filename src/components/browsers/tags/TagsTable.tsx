"use client";

import { ConfirmDeleteDialog } from "@/components/actions/ConfirmDeleteDialog";
import { TagEditorDialog } from "@/components/forms/tags/TagEditorDialog";
import { Card } from "@/components/layout/Card";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/generated/prisma/client";
import { FOCUS_RING } from "@/lib/styles";
import { addTag, deleteTag, updateTag } from "@/services/tagService";
import { useState } from "react";

const COLS = "minmax(0, 2fr) minmax(0, 1fr) 96px 96px";
const DEFAULT_COLOR = "#7c3aed";

type Props = {
  tags: Tag[];
  onTagsChange?: () => Promise<void> | void;
};

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function TagsTable({ tags, onTagsChange }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  function openCreateDialog() {
    setEditingTag(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(tag: Tag) {
    setEditingTag(tag);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingTag(null);
  }

  async function handleSubmit(values: { name: string; color: string }) {
    if (editingTag) {
      await updateTag(editingTag.id, values);
    } else {
      await addTag(values);
    }

    await onTagsChange?.();
    closeDialog();
  }

  function openDeleteDialog(tag: Tag) {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setIsDeleteDialogOpen(false);
    setTagToDelete(null);
  }

  async function handleDelete() {
    if (!tagToDelete) return;

    await deleteTag(tagToDelete.id);
    await onTagsChange?.();
    closeDeleteDialog();
  }

  return (
    <>
      <Card padding={0}>
        <div className="border-ink/[0.06] flex items-center justify-between border-b px-4 py-3">
          <div>
            <div className="text-ink text-sm font-semibold">Tag list</div>
            <div className="text-ink-muted text-xs">
              Create, edit, or remove tags
            </div>
          </div>
          <Button type="button" primary onClick={openCreateDialog}>
            Create tag
          </Button>
        </div>

        <div
          className="text-ink-soft text-eyebrow border-ink/[0.06] grid border-b uppercase"
          style={{ gridTemplateColumns: COLS, padding: "10px 16px" }}
        >
          <div>Name</div>
          <div>Color</div>
          <div>Edit</div>
          <div>Delete</div>
        </div>

        {tags.length === 0 ? (
          <div className="text-ink-muted px-4 py-8 text-center text-sm">
            No tags yet. Create your first tag to get started.
          </div>
        ) : (
          tags.map((tag, i) => (
            <div
              key={tag.id}
              className={`hover:bg-ink/[0.03] text-body grid items-center transition-colors ${FOCUS_RING.paper}`}
              style={{
                gridTemplateColumns: COLS,
                padding: "10px 16px",
                borderTop: i === 0 ? "none" : "1px solid rgba(26,24,21,0.04)",
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="border-ink/10 h-3.5 w-3.5 rounded-full border"
                  style={{ backgroundColor: tag.color ?? DEFAULT_COLOR }}
                />
                <div className="text-ink inline-block truncate font-medium">
                  {capitalizeFirstLetter(tag.name)}
                </div>
              </div>
              <div className="min-w-0">
                <span
                  className="rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase"
                  style={{
                    borderColor: tag.color ?? DEFAULT_COLOR,
                    color: tag.color ?? DEFAULT_COLOR,
                    backgroundColor: `${tag.color ?? DEFAULT_COLOR}18`,
                  }}
                >
                  {tag.color ?? DEFAULT_COLOR}
                </span>
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => openEditDialog(tag)}
                  className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${FOCUS_RING.paper} hover:bg-ink/5`}
                >
                  Edit
                </button>
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => openDeleteDialog(tag)}
                  className={`text-rose rounded-md px-2.5 py-1.5 text-sm transition-colors ${FOCUS_RING.paper} hover:bg-rose/5`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => void handleDelete()}
        title={`Delete ${tagToDelete?.name ?? "tag"}?`}
        description={
          <>This tag will be removed from all teas and the list of tags.</>
        }
        confirmLabel="Delete tag"
      />

      <TagEditorDialog
        open={isDialogOpen}
        onClose={closeDialog}
        initialTag={editingTag}
        onSubmit={handleSubmit}
        title={editingTag ? "Edit tag" : "Create tag"}
        submitLabel={editingTag ? "Save changes" : "Create tag"}
      />
    </>
  );
}
