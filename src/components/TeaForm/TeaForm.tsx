"use client";

import { SectionHead } from "@/components/admin/SectionHead";
import { Field } from "@/components/forms/Field";
import { PhotoDrop } from "@/components/forms/PhotoDrop";
import { TagPicker } from "@/components/forms/TagPicker";
import { TextInput } from "@/components/forms/TextInput";
import { Card } from "@/components/ui/Card";
import { TeaCreateInput } from "@/generated/prisma/models";
import { PhotoRef, TeaTag } from "@/lib/types";
import { Link } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { ConfirmDiscardDialog } from "../admin/ConfirmDiscardDialog";
import { Button, buttonClassName } from "../ui/Button";

interface Props {
  id: string;
  backlink?: string;
  onSubmit?: (value: TeaCreateInput) => void | Promise<void>;
}

export function TeaForm({ id, backlink, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState<TeaTag[]>([]);
  const [photo, setPhoto] = useState<PhotoRef | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const toggleTag = (tag: TeaTag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const isValid = name.trim().length > 0;

  const isDirty = name.trim() !== "" || tags.length > 0 || photo !== null;

  return (
    <>
      <form
        id={id}
        onSubmit={async e => {
          e.preventDefault();

          if (!isValid || submitting) return;
          setSubmitting(true);
          if (onSubmit) {
            try {
              await onSubmit({
                name,
                tags,
              });
            } catch {
              setSubmitting(false);
            }
          }
        }}
        className="grid items-start"
        style={{ gridTemplateColumns: "1fr 1.4fr", gap: 16 }}
      >
        <div className="flex flex-col" style={{ gap: 16 }}>
          <Card>
            <SectionHead title="Photo" />
            <PhotoDrop value={photo} onChange={setPhoto} />
          </Card>
        </div>

        <Card>
          <SectionHead title="Details" />
          <div className="flex flex-col" style={{ gap: 18, marginTop: 4 }}>
            <Field label="Name" required>
              <TextInput
                value={name}
                onChange={setName}
                placeholder="e.g. White Raspberry"
                autoFocus
                large
              />
            </Field>

            <Field
              label="Tags"
              hint="Students use these to filter the feed. Pick all that apply."
            >
              <TagPicker value={tags} onToggle={toggleTag} />
            </Field>
          </div>
        </Card>
        <div className="col-span-full mt-4 flex w-full justify-end gap-4">
          <Link
            href="/"
            className={buttonClassName()}
            onClick={e => {
              if (isDirty) {
                e.preventDefault();
                setShowCancelConfirm(true);
              }
            }}
          >
            Cancel
          </Link>

          <Button
            primary
            type="submit"
            form={id}
            disabled={!isValid || submitting}
          >
            {submitting ? "Creating…" : "Create tea"}
          </Button>
        </div>
      </form>

      <ConfirmDiscardDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => redirect(backlink ?? "/")}
      />
    </>
  );
}
