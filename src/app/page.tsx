"use client";

import { FeedHeader } from "@/components/feed/FeedHeader";
import { TeaBrowser } from "@/components/TeaBrowser/TeaBrowser";
import { TeaSheet } from "@/components/TeaSheet/TeaSheet";
import { TeaStat } from "@/lib/types";
import type { RatingPayload } from "@/lib/types";
import { addReview, getMyRatings } from "@/services/reviewService";
import { getTeaCatalog } from "@/services/statisticsService";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [teas, setTeas] = useState<TeaStat[] | null>(null);
  const [openedTeaId, setOpenedTeaId] = useState<string | null>(null);
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    let ignore = false;

    getMyRatings()
      .then(rows => {
        if (!ignore) {
          setMyRatings(rows);
        }
      })
      .catch(error => {
        console.error("Failed to fetch my reviews: ", error);
      });

    getTeaCatalog()
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

  const ratedIds = useMemo(() => new Set(Object.keys(myRatings)), [myRatings]);

  const handleSubmit = async (payload: RatingPayload) => {
    try {
      await addReview({
        rating: payload.rating,
        comment: payload.comment,
        tea: {
          connect: {
            id: payload.teaId,
          },
        },
      });

      setMyRatings(prev => {
        const next: Record<string, number> = { ...prev };
        next[payload.teaId] = payload.rating;
        return next;
      });
      setOpenedTeaId(null);
    } catch (error) {
      console.error("Failed to submit rating", error);
    }
  };

  const existingRating = openedTeaId ? (myRatings[openedTeaId] ?? null) : null;

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
      <TeaSheet
        teaId={openedTeaId}
        existingRating={existingRating}
        onClose={() => setOpenedTeaId(null)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
