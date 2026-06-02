"use client";

import { BackLink } from "@/components/admin/BackLink";
import { ConfirmDiscardDialog } from "@/components/admin/ConfirmDiscardDialog";
import { Dialog } from "@/components/admin/Dialog";
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
import { ratingColor } from "@/lib/admin/colors";
import { ratingAverage, ratingTotal } from "@/lib/admin/ratings";
import {
  DIET_TAG_SET,
  isValidRow,
  newIngredientRow,
  parseAmount,
  type ClimateFormState,
  type IngredientRow,
  type IngredientUnit,
  type PhotoRef,
  type TeaStat,
} from "@/lib/admin/types";
import { getFeedDateKey } from "@/lib/dateFormat";
import type { DietTag } from "@/lib/types";
import {
  getLunchById,
  removeLunch,
  updateLunch,
} from "@/services/lunchService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import z from "zod";

const FORM_ID = "edit-tea-form";

type Initial = {
  name: string;
  line: TeaStat["line"];
  tags: DietTag[];
  ingredients: IngredientRow[];
  photo: PhotoRef | null;
  climate: ClimateFormState;
};

function seedForm(tea: TeaStat): Initial {
  const ingredients: IngredientRow[] =
    tea.ingredients.length > 0
      ? tea.ingredients.map(ingredient => ({
          id: ingredient.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        }))
      : [newIngredientRow()];
  // Form only manages diet tags
  const tags = tea.tags.filter((t): t is DietTag => DIET_TAG_SET.has(t));
  const climate: ClimateFormState =
    tea.co2 != null && tea.co2 > 0
      ? {
          state: "done",
          kg: tea.co2,
          calculatedFromCount: tea.ingredients.length,
        }
      : { state: "idle", kg: null, calculatedFromCount: 0 };
  return {
    name: tea.name,
    line: tea.line,
    tags,
    ingredients,
    photo: tea.photo ?? null,
    climate,
  };
}

export default function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [tea, setTea] = useState<TeaStat | null>(null);

  useEffect(() => {
    getLunchById(Number(id))
      .catch(reason => {
        console.warn(reason);
        return null;
      })
      .then(lunch => {
        setIsLoading(false);
        if (lunch == null) {
          return;
        }

        const MealLine = z.enum([
          "Vegetarian",
          "Nordic",
          "Street food",
        ] as const);
        const line = MealLine.parse(lunch.line);

        const reviews = lunch.servings.map(serving => serving.reviews).flat(1);
        const votes = reviews.length;
        const rating =
          reviews.length === 0
            ? null
            : reviews.map(review => review.rating).reduce((acc, x) => x + acc) /
              votes;
        const countReviews = (rating: number) =>
          reviews.filter(review => review.rating == rating).length;
        const distribution: [number, number, number, number, number] = [
          countReviews(1),
          countReviews(2),
          countReviews(3),
          countReviews(4),
          countReviews(5),
        ];

        // Future-scheduled servings shouldn't appear as "last served". Use
        // the shared UTC date-key helper so this matches statisticsService.
        const todayKey = getFeedDateKey(new Date());
        const pastServingTimes = lunch.servings
          .filter(s => getFeedDateKey(s.date) <= todayKey)
          .map(s => s.date.getTime());
        const lastServedDate = pastServingTimes.length
          ? new Date(Math.max(...pastServingTimes))
          : null;

        setTea({
          id: lunch.id,
          name: lunch.name,
          line,
          tags: lunch.tags,
          rating,
          votes,
          distribution,
          co2: lunch.ecoScore,
          climate: null,
          lastServed: lastServedDate ? lastServedDate.toString() : "—",
          ingredients: lunch.ingredients.map(dbIngredient => {
            return {
              id: dbIngredient.id,
              unit: dbIngredient.unit as IngredientUnit,
              name: dbIngredient.name,
              amount: dbIngredient.amount,
            };
          }),
          photo: undefined,
        });
      });
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!tea) {
    return <p>Could not find tea</p>;
  }

  return <EditMealForm tea={tea} />;
}

function EditMealForm({ tea }: { tea: TeaStat }) {
  const router = useRouter();
  const initial = useMemo(() => seedForm(tea), [tea]);

  const [name, setName] = useState(initial.name);
  const [line, setLine] = useState(initial.line);
  const [tags, setTags] = useState(initial.tags);
  const [ingredients, setIngredients] = useState(initial.ingredients);
  const [photo, setPhoto] = useState(initial.photo);
  const [climate, setClimate] = useState(initial.climate);
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [savedInitialKey, setSavedInitialKey] = useState<string | null>(null);

  const toggleTag = (tag: DietTag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const isValid =
    name.trim().length > 0 &&
    ingredients.some(r => r.name.trim() && parseAmount(r.amount) > 0);

  const initialKey = useMemo(
    () =>
      savedInitialKey ??
      JSON.stringify({
        name: initial.name,
        line: initial.line,
        tags: initial.tags,
        ingredients: initial.ingredients,
        photo: initial.photo,
        kg: initial.climate.kg,
      }),
    [initial, savedInitialKey]
  );

  const isDirty = useMemo(() => {
    const current = JSON.stringify({
      name,
      line,
      tags,
      ingredients,
      photo,
      kg: climate.kg,
    });
    return current !== initialKey;
  }, [name, line, tags, ingredients, photo, climate.kg, initialKey]);

  const total = ratingTotal(tea.distribution);
  const avg = ratingAverage(tea.distribution);
  const visibleAvg = total > 0 ? avg.toFixed(1) : "—";
  const avgColor = total === 0 ? "var(--color-ink-muted)" : ratingColor(avg);

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const updated = await updateLunch(tea.id, ingredients, {
        name,
        line,
        description: "",
        tags,
      });
      setClimate({
        state: "done",
        kg: updated.ecoScore,
        calculatedFromCount: ingredients.filter(isValidRow).length,
      });
      const currentKey = JSON.stringify({
        name,
        line,
        tags,
        ingredients,
        photo,
        kg: updated.ecoScore,
      });
      setSavedInitialKey(currentKey);
      setSubmitting(false);

      router.push(`/admin/teas/${updated.id}/edit`);
    } catch {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setShowDelete(false);
    setSubmitting(true);
    try {
      await removeLunch(tea.id);
      router.push("/admin/teas");
    } catch {
      setSubmitting(false);
    }
  };

  const cancelHref = `/admin/teas/${tea.id}`;
  const guardCancel = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty) {
      e.preventDefault();
      setShowCancelConfirm(true);
    }
  };

  return (
    <PageShell
      title={
        <>
          <BackLink href={cancelHref} onClick={guardCancel}>
            ← {tea.name}
          </BackLink>
          <span>Edit tea</span>
        </>
      }
      subtitle={
        tea.lastServed === "—"
          ? `Not served yet · ${total} ratings · ${visibleAvg} avg`
          : `Last served ${tea.lastServed} · ${total} ratings · ${visibleAvg} avg`
      }
      actions={
        <>
          <Button
            danger
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={submitting}
          >
            Delete
          </Button>
          <Link
            href={cancelHref}
            className={buttonClassName()}
            onClick={guardCancel}
          >
            Cancel
          </Link>
          <Button
            primary
            type="submit"
            form={FORM_ID}
            disabled={!isValid || !isDirty || submitting}
          >
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      {isDirty && (
        <div
          className="border-amber/30 bg-amber/[0.10]"
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
            · edits won&apos;t affect past ratings · changing ingredients will
            refresh climate impact on save
          </span>
        </div>
      )}

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

          <Card>
            <SectionHead title="History" />
            <HistoryRows
              total={total}
              avgLabel={visibleAvg}
              avgColor={avgColor}
              lastServed={tea.lastServed}
            />
          </Card>
        </div>

        <Card>
          <SectionHead title="Details" />
          <div className="flex flex-col" style={{ gap: 18, marginTop: 4 }}>
            <Field label="Tea name" required>
              <TextInput value={name} onChange={setName} large />
            </Field>

            <Field label="Line" required>
              <LineSegmented value={line} onChange={setLine} />
            </Field>

            <Field label="Tags" hint="Students use these to filter the feed.">
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

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Delete ${tea.name}?`}
        footer={
          <>
            <Button type="button" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button primary danger type="button" onClick={confirmDelete}>
              Delete tea
            </Button>
          </>
        }
      >
        The tea will be removed from the catalog. Past ratings stay in your
        reports but the tea won&apos;t be visible to users.
      </Dialog>

      <ConfirmDiscardDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => router.push(cancelHref)}
      />
    </PageShell>
  );
}

function HistoryRows({
  total,
  avgLabel,
  avgColor,
  lastServed,
}: {
  total: number;
  avgLabel: string;
  avgColor: string;
  lastServed: string;
}) {
  // TODO: First served + Times served need backend fields. Placeholders for now.
  const rows: { label: string; value: string; color?: string }[] = [
    { label: "First served", value: "—" },
    { label: "Last served", value: lastServed },
    { label: "Times served", value: "—" },
    { label: "Total ratings", value: total.toLocaleString() },
    { label: "Average", value: avgLabel, color: avgColor },
  ];
  return (
    <div className="flex flex-col" style={{ gap: 10, fontSize: 12 }}>
      {rows.map(r => (
        <div key={r.label} className="flex items-baseline justify-between">
          <span className="text-ink-muted">{r.label}</span>
          <span
            className="tabular-nums"
            style={{
              color: r.color ?? "var(--color-ink)",
              fontWeight: r.color ? 600 : 500,
            }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}
