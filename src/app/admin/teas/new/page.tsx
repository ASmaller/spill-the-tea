"use client";

import { BackLink } from "@/components/admin/BackLink";
import { ConfirmDiscardDialog } from "@/components/admin/ConfirmDiscardDialog";
import { ClimateImpact } from "@/components/admin/forms/ClimateImpact";
import { Field } from "@/components/admin/forms/Field";
import { IngredientsEditor } from "@/components/admin/forms/IngredientsEditor";
import { LineSegmented } from "@/components/admin/forms/LineSegmented";
import { PhotoDrop } from "@/components/admin/forms/PhotoDrop";
import { TagPicker } from "@/components/admin/forms/TagPicker";
import { TextInput } from "@/components/admin/forms/TextInput";
import { PageShell } from "@/components/admin/PageShell";
import { SectionHead } from "@/components/admin/SectionHead";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DEFAULT_LINE,
  newIngredientRow,
  parseAmount,
  type ClimateFormState,
  type IngredientRow,
  type PhotoRef,
} from "@/lib/admin/types";
import type { DietTag, MealLine } from "@/lib/types";
import { addLunch } from "@/services/lunchService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FORM_ID = "new-tea-form";

export default function NewTeaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [line, setLine] = useState<MealLine>(DEFAULT_LINE);
  const [tags, setTags] = useState<DietTag[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    newIngredientRow(),
  ]);
  const [photo, setPhoto] = useState<PhotoRef | null>(null);
  const [climate, setClimate] = useState<ClimateFormState>({
    state: "idle",
    kg: null,
    calculatedFromCount: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const toggleTag = (tag: DietTag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const isValid =
    name.trim().length > 0 &&
    ingredients.some(r => r.name.trim() && parseAmount(r.amount) > 0);

  const isDirty =
    name.trim() !== "" ||
    line !== DEFAULT_LINE ||
    tags.length > 0 ||
    ingredients.some(r => r.name.trim() !== "") ||
    ingredients.some(r => r.amount !== 0) ||
    photo !== null ||
    climate.state !== "idle";

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const lunch = await addLunch(name, ingredients, { line, tags });
      router.push(`/admin/teas/${lunch.id}`);
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
          <Card>
            <SectionHead
              title="Climate impact"
              sub="Estimated from ingredients"
            />
            <ClimateImpact
              rows={ingredients}
              state={climate}
              onChange={setClimate}
            />
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

            <Field label="Line" required>
              <LineSegmented value={line} onChange={setLine} />
            </Field>

            <Field
              label="Tags"
              hint="Students use these to filter the feed. Pick all that apply."
            >
              <TagPicker value={tags} onToggle={toggleTag} />
            </Field>

            <Field
              label="Ingredients"
              required
              hint="Per-portion amounts. Climate impact is calculated from this list."
            >
              <IngredientsEditor rows={ingredients} onChange={setIngredients} />
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
