"use client";

import { FeedHeader } from "@/components/feed/FeedHeader";
import { MealSheet } from "@/components/sheet/MealSheet";
import { TeaBrowser } from "@/components/TeaBrowser/TeaBrowser";
import { MealStat } from "@/lib/admin/types";
import type { Day, Option, RatingPayload } from "@/lib/types";
import { addReview, getMyReviewSummaries } from "@/services/reviewService";
import { getAdminMealCatalog } from "@/services/statisticsService";
import { useEffect, useMemo, useState } from "react";

type Opened = { option: Option; day: Day };

export default function Home() {
  const [teas, setTeas] = useState<MealStat[] | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [myRatings, setMyRatings] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let ignore = false;

    getMyReviewSummaries()
      .then(rows => {
        if (!ignore) {
          setMyRatings(new Map(rows.map(r => [r.servingId, r.rating])));
        }
      })
      .catch(error => {
        console.error("Failed to fetch my reviews: ", error);
      });

    getAdminMealCatalog()
      .then(teas => {
        if (!ignore) {
          setTeas(teas);
        }
      })
      .catch(error => {
        console.error("Failed to fetch teas: ", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const ratedIds = useMemo(() => new Set(myRatings.keys()), [myRatings]);

  const handleSubmit = async (payload: RatingPayload) => {
    try {
      await addReview({
        rating: payload.rating,
        servingId: Number(payload.optionId),
        comment: payload.note,
        tags: payload.tags,
        userId: null,
      });

      setMyRatings(prev => {
        const next = new Map(prev);
        next.set(payload.optionId, payload.rating);
        return next;
      });
      setOpened(null);
    } catch (error) {
      console.error("Failed to submit rating", error);
    }
  };

  const existingRating = opened
    ? (myRatings.get(opened.option.id) ?? null)
    : null;

  return (
    <main className="relative">
      <FeedHeader />
      <div
        className="bg-cream flex-1 overflow-auto"
        style={{ padding: "24px 28px" }}
      >
        {teas != null ? (
          <TeaBrowser teas={teas} ratedIds={ratedIds} urlPrefix="/tea/" />
        ) : (
          <span>Loading teas...</span>
        )}
      </div>
      <MealSheet
        option={opened?.option ?? null}
        day={opened?.day ?? null}
        existingRating={existingRating}
        onClose={() => setOpened(null)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
