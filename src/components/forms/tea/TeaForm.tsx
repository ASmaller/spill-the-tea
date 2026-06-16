"use client";

import { ConfirmDiscardDialog } from "@/components/forms/ConfirmDiscardDialog";
import { Field } from "@/components/inputs/Field";
import { PhotoDrop } from "@/components/inputs/PhotoDrop";
import { TagPicker } from "@/components/inputs/TagPicker";
import { TextInput } from "@/components/inputs/TextInput";
import { Card } from "@/components/layout/Card";
import { SectionHead } from "@/components/layout/SectionHead";
import { Button, buttonClassName } from "@/components/primitives/Button";
import { Tea } from "@/generated/prisma/client";
import { TeaCreateInput } from "@/generated/prisma/models";
import { TeaTag } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface Props {
  id: string;
  initialTea?: Pick<Tea, "name" | "tags" | "image">;
  backHref?: string;
  onSubmit?: (
    value: TeaCreateInput,
    file?: File | null
  ) => void | Promise<void>;
}

export function TeaForm({
  id,
  initialTea = { name: "", tags: [], image: "" },
  backHref,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState<string>(initialTea.name);
  const [tags, setTags] = useState<string[]>(initialTea.tags);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleTag = (tag: TeaTag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const isValid = name.trim().length > 0;
  const isDirty =
    name.trim() !== initialTea.name.trim() ||
    JSON.stringify(tags) !== JSON.stringify(initialTea.tags) ||
    file !== null;

  const getSubmitErrorMessage = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Could not save tea.";

    if (message.includes("Body exceeded 1 MB limit")) {
      return "The uploaded file is too large. Please choose a image smaller than 1 MB";
    }

    return message;
  };

  return (
    <>
      {isDirty && (
        <div
          className="border-amber/30 bg-amber/10"
          style={{
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "solid",
            fontSize: 12,
          }}
          role="status"
        >
          <span className="text-ink font-semibold">Unsaved changes</span>
          <span className="text-ink-muted">
            {" "}
            · submit your changes below to save the tea
          </span>
        </div>
      )}
      {submitError && (
        <div
          className="border-rose-deep/30 bg-rose-deep/10"
          style={{
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "solid",
            fontSize: 12,
          }}
          role="status"
        >
          <span className="text-ink font-semibold">An error occurred</span>
          <span className="text-ink-muted"> · {submitError}</span>
        </div>
      )}
      <form
        id={id}
        onSubmit={async e => {
          e.preventDefault();

          if (!isValid || submitting) return;
          setSubmitError(null);
          setSubmitting(true);
          if (onSubmit) {
            try {
              await onSubmit(
                {
                  name,
                  tags,
                },
                file
              );
            } catch (error) {
              setSubmitError(getSubmitErrorMessage(error));
            } finally {
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
            <PhotoDrop setFile={setFile} image={initialTea.image} />
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

            <Field label="Tags" hint="Pick all that apply">
              <TagPicker value={tags} onToggle={toggleTag} />
            </Field>
          </div>
        </Card>
        <div className="col-span-full mt-4 flex w-full justify-end gap-4">
          {backHref && (
            <Link
              href={backHref ?? "/"}
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
          )}

          <Button
            primary
            type="submit"
            form={id}
            disabled={!isValid || submitting}
          >
            {submitting
              ? "Submitting…"
              : isValid
                ? "Submit tea"
                : "Provide a name"}
          </Button>
        </div>
      </form>

      {backHref && (
        <ConfirmDiscardDialog
          open={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={() => router.push(backHref ?? "/")}
        />
      )}
    </>
  );
}
