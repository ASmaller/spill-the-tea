"use client";

import { BackLink } from "@/components/admin/BackLink";
import { ConfirmDiscardDialog } from "@/components/admin/ConfirmDiscardDialog";
import { Field } from "@/components/admin/forms/Field";
import { PhotoDrop } from "@/components/admin/forms/PhotoDrop";
import { TagPicker } from "@/components/admin/forms/TagPicker";
import { TextInput } from "@/components/admin/forms/TextInput";
import { PageShell } from "@/components/admin/PageShell";
import { SectionHead } from "@/components/admin/SectionHead";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { type PhotoRef } from "@/lib/types";
import type { TeaTag } from "@/lib/types";
import { addTea } from "@/services/teaService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FORM_ID = "new-tea-form";

export default function NewTeaPage() {
  const router = useRouter();
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

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const tea = await addTea({ name, tags });
      router.push(`/admin/teas/${tea.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title={
        <>
          <BackLink href="/admin/teas">← Teas</BackLink>
          <span>New tea</span>
        </>
      }
      subtitle="Add a tea to the catalog"
      actions={
        <>
          <Link
            href="/admin/teas"
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
            form={FORM_ID}
            disabled={!isValid || submitting}
          >
            {submitting ? "Creating…" : "Create tea"}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={e => {
          e.preventDefault();
          submit();
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
      </form>

      <ConfirmDiscardDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => router.push("/admin/teas")}
      />
    </PageShell>
  );
}
