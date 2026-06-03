"use client";

import { BackLink } from "@/components/admin/BackLink";
import { ConfirmDiscardDialog } from "@/components/admin/ConfirmDiscardDialog";
import { Dialog } from "@/components/admin/Dialog";
import { Field } from "@/components/admin/forms/Field";
import { PhotoDrop } from "@/components/admin/forms/PhotoDrop";
import { TagPicker } from "@/components/admin/forms/TagPicker";
import { TextInput } from "@/components/admin/forms/TextInput";
import { PageShell } from "@/components/admin/PageShell";
import { SectionHead } from "@/components/admin/SectionHead";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ratingColor } from "@/lib/admin/colors";
import { ratingAverage, ratingTotal } from "@/lib/admin/ratings";
import { isTeaTag, TeaTag, type PhotoRef, type TeaStat } from "@/lib/types";
import {
  deleteTeaById,
  getTeaWithReviewsById,
  updateTea,
} from "@/services/teaService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";

const FORM_ID = "edit-tea-form";

type Initial = {
  name: string;
  tags: TeaTag[];
  photo: PhotoRef | null;
};

function seedForm(tea: TeaStat): Initial {
  const tags = tea.tags.filter(t => isTeaTag(t));
  return {
    name: tea.name,
    tags,
    photo: tea.photo ?? null,
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
    getTeaWithReviewsById(id)
      .catch(reason => {
        console.warn(reason);
        return null;
      })
      .then(tea => {
        setIsLoading(false);
        if (tea == null) {
          return;
        }

        const votes = tea.reviews.length;
        const rating =
          tea.reviews.length === 0
            ? null
            : tea.reviews
                .map(review => review.rating)
                .reduce((acc, x) => x + acc) / votes;
        const countReviews = (rating: number) =>
          tea.reviews.filter(review => review.rating == rating).length;
        const distribution: [number, number, number, number, number] = [
          countReviews(1),
          countReviews(2),
          countReviews(3),
          countReviews(4),
          countReviews(5),
        ];

        setTea({
          id: tea.id,
          name: tea.name,
          tags: tea.tags,
          rating,
          votes,
          distribution,
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
  const [tags, setTags] = useState(initial.tags);
  const [photo, setPhoto] = useState(initial.photo);
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [savedInitialKey, setSavedInitialKey] = useState<string | null>(null);

  const toggleTag = (tag: TeaTag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );

  const isValid = name.trim().length > 0;

  const initialKey = useMemo(
    () =>
      savedInitialKey ??
      JSON.stringify({
        name: initial.name,
        tags: initial.tags,
        photo: initial.photo,
      }),
    [initial, savedInitialKey]
  );

  const isDirty = useMemo(() => {
    const current = JSON.stringify({
      name,
      tags,
      photo,
    });
    return current !== initialKey;
  }, [name, tags, photo, initialKey]);

  const total = ratingTotal(tea.distribution);
  const avg = ratingAverage(tea.distribution);
  const visibleAvg = total > 0 ? avg.toFixed(1) : "—";
  const avgColor = total === 0 ? "var(--color-ink-muted)" : ratingColor(avg);

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const updated = await updateTea(tea.id, {
        name,
        description: "",
        tags,
      });
      const currentKey = JSON.stringify({
        name,
        tags,
        photo,
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
      await deleteTeaById(tea.id);
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
            <SectionHead title="History" />
            <HistoryRows
              total={total}
              avgLabel={visibleAvg}
              avgColor={avgColor}
              lastServed={"N/A"}
            />
          </Card>
        </div>

        <Card>
          <SectionHead title="Details" />
          <div className="flex flex-col" style={{ gap: 18, marginTop: 4 }}>
            <Field label="Tea name" required>
              <TextInput value={name} onChange={setName} large />
            </Field>

            <Field label="Tags" hint="Students use these to filter the feed.">
              <TagPicker value={tags} onToggle={toggleTag} />
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
