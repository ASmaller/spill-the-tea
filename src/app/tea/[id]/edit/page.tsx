"use client";

import { BackLink } from "@/components/admin/BackLink";
import { ConfirmDiscardDialog } from "@/components/admin/ConfirmDiscardDialog";
import { PageShell } from "@/components/admin/PageShell";
import { SectionHead } from "@/components/admin/SectionHead";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { Field } from "@/components/forms/Field";
import { PhotoDrop } from "@/components/forms/PhotoDrop";
import { TagPicker } from "@/components/forms/TagPicker";
import { TextInput } from "@/components/forms/TextInput";
import { EditTeaForm } from "@/components/TeaForm/EditTeaForm";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isTeaTag, TeaTag, type PhotoRef, type TeaStat } from "@/lib/types";
import { getTeaWithReviewsById, updateTea } from "@/services/teaService";
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

export default function EditTeaPage({
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

  return (
    <>
      <FeedHeader />
      <PageShell
        backlink={<BackLink href={`/tea/${tea.id}`}>← {tea.name}</BackLink>}
        title={"Edit tea"}
      >
        <main>
          <EditTeaForm id={tea.id} initialTea={tea} />
        </main>
      </PageShell>
    </>
  );
}
